import type { BookSpec, DailyWorkEntry, Project, PageStatus } from "~/types/project";
import { calculateStatusCompletedMinutes } from "~/composables/useProgress";
import { useSettings } from "~/composables/useSettings";
import { useState } from "#app";

const STORAGE_KEY = "doujin-progress-projects";

type ProjectInfoInput = {
  eventName: string;
  title: string;
  startDate: string;
  eventDate: string;
  deadline: string;
  totalPages: number;
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

export const useProjects = () => {
  const projects = useState<Project[]>("projects", () => []);
  const { settings, loadSettings } = useSettings();

  const loadProjects = () => {
    if (import.meta.server) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    projects.value = JSON.parse(saved).map((project: Project) => {
      const hasLegacyProgress = project.pages.some((page) => "progress" in page);

      return {
        ...project,
        eventName: project.eventName ?? "",
        startDate: project.startDate ?? "",
        eventDate: project.eventDate ?? "",
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

    project.eventName = input.eventName;
    project.title = input.title;
    project.startDate = input.startDate;
    project.eventDate = input.eventDate;
    project.deadline = input.deadline;
    project.totalPages = totalPages;
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
      settings.value.defaultStepMinutes
    );
    page.status = status;

    if (options.syncDailyActual && options.workDate) {
      const actualDelta =
        calculateStatusCompletedMinutes(
          page.status,
          settings.value.defaultStepMinutes
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
  };
};
