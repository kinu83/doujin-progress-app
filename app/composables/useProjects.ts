import type { BookSpec, DailyWorkEntry, Project, PageStatus } from "~/types/project";
import type { WorkProcess, WorkProcessStep } from "~/types/settings";
import { calculateStatusCompletedMinutes } from "~/composables/useProgress";
import { DEFAULT_WORK_PROCESS, useSettings } from "~/composables/useSettings";
import { useState } from "#app";

const STORAGE_KEY = "doujin-progress-projects";

type ProjectInfoInput = {
  eventName: string;
  title: string;
  startDate: string;
  eventDate: string;
  deadline: string;
  totalPages: number;
  workProcessId: string;
};

type BookSpecInput = BookSpec & {
  totalPages: number;
};

type CreateProjectInput = {
  eventName?: string;
  title: string;
  startDate?: string;
  eventDate?: string;
  deadline: string;
  totalPages: number;
  workProcessId?: string;
};

type UpdatePageStatusOptions = {
  workDate?: string;
  syncDailyActual?: boolean;
};

const defaultBookSpec = (): BookSpec => ({
  colorMode: "モノクロ",
  coverPaper: "",
  bodyPaper: "",
  printer: "",
  printRun: 0,
  budget: 0,
});

const normalizeDailyWorkEntries = (
  entries: Record<string, DailyWorkEntry> | undefined,
  shouldMigrateFromLegacyWorkUnits: boolean
) => {
  return Object.fromEntries(
    Object.entries(entries ?? {}).map(([date, entry]) => {
      const multiplier = shouldMigrateFromLegacyWorkUnits ? 3 : 1;

      return [
        date,
        {
          planned: Math.max(0, Number(entry.planned) || 0) * multiplier,
          actual: Math.max(0, Number(entry.actual) || 0) * multiplier,
        },
      ];
    })
  );
};

const workProcessToProjectFields = (process: WorkProcess) => {
  return {
    workProcessId: process.id,
    workProcessName: process.name,
    workProcessSteps: process.steps.map((step) => ({ ...step })),
  };
};

const normalizeProjectSteps = (
  steps: Array<string | Partial<WorkProcessStep>> | undefined
) => {
  const normalized = (steps ?? []).reduce<WorkProcessStep[]>((result, step) => {
    const name = typeof step === "string" ? step.trim() : String(step.name ?? "").trim();
    if (!name || result.some((item) => item.name === name)) return result;

    const minutesPerPage = typeof step === "string"
      ? 60
      : Math.max(1, Math.round(Number(step.minutesPerPage) || 60));

    result.push({ name, minutesPerPage });
    return result;
  }, []);

  return normalized.length > 0
    ? normalized
    : DEFAULT_WORK_PROCESS.steps.map((step) => ({ ...step }));
};

const getProjectStatusList = (steps: WorkProcessStep[]) => [
  "未着手",
  ...steps.map((step) => step.name),
];

const normalizeStatusForSteps = (
  status: PageStatus,
  previousSteps: WorkProcessStep[],
  nextSteps: WorkProcessStep[]
) => {
  const nextStatuses = getProjectStatusList(nextSteps);
  if (nextStatuses.includes(status)) return status;

  const previousStatuses = getProjectStatusList(previousSteps);
  const previousIndex = previousStatuses.indexOf(status);
  if (previousIndex === previousStatuses.length - 1) {
    return nextStatuses[nextStatuses.length - 1];
  }

  return "未着手";
};

export const useProjects = () => {
  const projects = useState<Project[]>("projects", () => []);
  const { settings, loadSettings, getWorkProcessById } = useSettings();

  const loadProjects = () => {
    if (import.meta.server) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    loadSettings();

    projects.value = JSON.parse(saved).map((project: Project) => {
      const hasLegacyProgress = project.pages.some((page) => "progress" in page);
      const processFields = {
        workProcessId: project.workProcessId ?? DEFAULT_WORK_PROCESS.id,
        workProcessName: project.workProcessName ?? DEFAULT_WORK_PROCESS.name,
        workProcessSteps: normalizeProjectSteps(project.workProcessSteps),
      };

      return {
        ...project,
        eventName: project.eventName ?? "",
        startDate: project.startDate ?? "",
        eventDate: project.eventDate ?? "",
        ...processFields,
        bookSpec: {
          ...defaultBookSpec(),
          ...(project.bookSpec ?? {}),
        },
        pages: project.pages.map((page) => ({
          pageNumber: page.pageNumber,
          status: page.status,
        })),
        dailyWorkEntries: normalizeDailyWorkEntries(
          project.dailyWorkEntries,
          hasLegacyProgress
        ),
      };
    });
  };

  const saveProjects = () => {
    if (import.meta.server) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value));
  };

  const createProject = (input: CreateProjectInput) => {
    loadSettings();
    const workProcess = input.workProcessId
      ? getWorkProcessById(input.workProcessId)
      : getWorkProcessById(settings.value.defaultWorkProcessId);
    const processFields = workProcessToProjectFields(workProcess ?? DEFAULT_WORK_PROCESS);
    const totalPages = Math.max(1, input.totalPages);
    const pages = Array.from({ length: totalPages }, (_, index) => {
      const status: PageStatus = "未着手";

      return {
        pageNumber: index + 1,
        status,
      };
    });

    const project: Project = {
      id: crypto.randomUUID(),
      eventName: input.eventName ?? "",
      title: input.title,
      startDate: input.startDate ?? "",
      eventDate: input.eventDate ?? "",
      deadline: input.deadline,
      totalPages,
      ...processFields,
      bookSpec: defaultBookSpec(),
      pages,
      dailyWorkEntries: {},
      createdAt: new Date().toISOString(),
    };

    projects.value.push(project);
    saveProjects();

    return project;
  };

  const getProjectById = (id: string) => {
    return projects.value.find((project) => project.id === id);
  };

  const deleteProject = (projectId: string) => {
    const projectIndex = projects.value.findIndex(
      (project) => project.id === projectId
    );
    if (projectIndex === -1) return false;

    projects.value.splice(projectIndex, 1);
    saveProjects();

    return true;
  };

  const updateProjectInfo = (projectId: string, input: ProjectInfoInput) => {
    const project = getProjectById(projectId);
    if (!project) return false;

    if (input.startDate && input.deadline && input.startDate > input.deadline) {
      return false;
    }

    if (input.deadline && input.eventDate && input.deadline > input.eventDate) {
      return false;
    }

    const totalPages = Math.max(1, input.totalPages);
    loadSettings();
    const workProcess = getWorkProcessById(input.workProcessId);
    const nextProcessFields = workProcessToProjectFields(workProcess ?? {
      id: project.workProcessId,
      name: project.workProcessName,
      steps: project.workProcessSteps,
    });
    const currentPages = project.pages;
    const nextPages = Array.from({ length: totalPages }, (_, index) => {
      const existingPage = currentPages[index];
      if (existingPage) return existingPage;

      const status: PageStatus = "未着手";
      return {
        pageNumber: index + 1,
        status,
      };
    }).map((page, index) => ({
      ...page,
      pageNumber: index + 1,
      status: normalizeStatusForSteps(
        page.status,
        project.workProcessSteps,
        nextProcessFields.workProcessSteps
      ),
    }));

    project.eventName = input.eventName;
    project.title = input.title;
    project.startDate = input.startDate;
    project.eventDate = input.eventDate;
    project.deadline = input.deadline;
    project.totalPages = totalPages;
    project.workProcessId = nextProcessFields.workProcessId;
    project.workProcessName = nextProcessFields.workProcessName;
    project.workProcessSteps = nextProcessFields.workProcessSteps;
    project.pages = nextPages;

    saveProjects();

    return true;
  };

  const updateBookSpec = (projectId: string, input: BookSpecInput) => {
    const project = getProjectById(projectId);
    if (!project) return false;

    const totalPages = Math.max(1, Number(input.totalPages) || 1);
    const currentPages = project.pages;
    const nextPages = Array.from({ length: totalPages }, (_, index) => {
      const existingPage = currentPages[index];
      if (existingPage) return existingPage;

      const status: PageStatus = "未着手";
      return {
        pageNumber: index + 1,
        status,
      };
    }).map((page, index) => ({
      ...page,
      pageNumber: index + 1,
    }));

    project.totalPages = totalPages;
    project.pages = nextPages;
    project.bookSpec = {
      colorMode: input.colorMode,
      coverPaper: input.coverPaper.trim(),
      bodyPaper: input.bodyPaper.trim(),
      printer: input.printer.trim(),
      printRun: Math.max(0, Number(input.printRun) || 0),
      budget: Math.max(0, Number(input.budget) || 0),
    };

    saveProjects();

    return true;
  };

  const updatePageStatus = (
    projectId: string,
    pageNumber: number,
    status: PageStatus,
    options: UpdatePageStatusOptions = {}
  ) => {
    const project = getProjectById(projectId);
    if (!project) return;

    const page = project.pages.find((p) => p.pageNumber === pageNumber);
    if (!page) return;

    loadSettings();

    const previousActualMinutes = calculateStatusCompletedMinutes(
      page.status,
      project.workProcessSteps
    );
    page.status = status;

    if (options.syncDailyActual && options.workDate) {
      const actualDelta =
        calculateStatusCompletedMinutes(
          page.status,
          project.workProcessSteps
        ) - previousActualMinutes;
      applyDailyActualDelta(project, options.workDate, actualDelta);
    }

    saveProjects();
  };

  const applyDailyActualDelta = (
    project: Project,
    date: string,
    actualDelta: number
  ) => {
    if (actualDelta === 0) return;

    const current = project.dailyWorkEntries[date] ?? {
      planned: 0,
      actual: 0,
    };
    const actual = Math.max(0, current.actual + actualDelta);

    if (current.planned === 0 && actual === 0) {
      delete project.dailyWorkEntries[date];
      return;
    }

    project.dailyWorkEntries[date] = {
      planned: current.planned,
      actual,
    };
  };

  const updateDailyWorkEntry = (
    projectId: string,
    date: string,
    entry: DailyWorkEntry
  ) => {
    const project = getProjectById(projectId);
    if (!project) return;

    const planned = Math.max(0, Number(entry.planned) || 0);
    const actual = Math.max(0, Number(entry.actual) || 0);

    if (planned === 0 && actual === 0) {
      delete project.dailyWorkEntries[date];
    } else {
      project.dailyWorkEntries[date] = {
        planned,
        actual,
      };
    }

    saveProjects();
  };

  const applyWorkProcessToProjects = (process: WorkProcess) => {
    let hasUpdatedProject = false;

    projects.value.forEach((project) => {
      if (project.workProcessId !== process.id) return;

      const previousSteps = project.workProcessSteps;
      const nextProcessFields = workProcessToProjectFields(process);
      project.workProcessName = nextProcessFields.workProcessName;
      project.workProcessSteps = nextProcessFields.workProcessSteps;
      project.pages = project.pages.map((page) => ({
        ...page,
        status: normalizeStatusForSteps(
          page.status,
          previousSteps,
          nextProcessFields.workProcessSteps
        ),
      }));
      hasUpdatedProject = true;
    });

    if (hasUpdatedProject) {
      saveProjects();
    }

    return hasUpdatedProject;
  };

  return {
    projects,
    loadProjects,
    saveProjects,
    createProject,
    getProjectById,
    deleteProject,
    updateProjectInfo,
    updateBookSpec,
    updatePageStatus,
    updateDailyWorkEntry,
    applyWorkProcessToProjects,
  };
};
