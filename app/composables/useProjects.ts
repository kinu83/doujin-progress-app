import type { DailyWorkEntry, Project, PageStatus } from "~/types/project";
import { progressMap } from "~/composables/useProgress";
import { useState } from "#app";

const STORAGE_KEY = "doujin-progress-projects";

type ProjectInfoInput = {
  title: string;
  startDate: string;
  eventDate: string;
  deadline: string;
  totalPages: number;
};

type CreateProjectInput = {
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

export const useProjects = () => {
  const projects = useState<Project[]>("projects", () => []);

  const loadProjects = () => {
    if (import.meta.server) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    projects.value = JSON.parse(saved).map((project: Project) => ({
      ...project,
      startDate: project.startDate ?? "",
      eventDate: project.eventDate ?? "",
      dailyWorkEntries: project.dailyWorkEntries ?? {},
    }));
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
        progress: progressMap[status],
      };
    });

    const project: Project = {
      id: crypto.randomUUID(),
      title: input.title,
      startDate: input.startDate ?? "",
      eventDate: input.eventDate ?? "",
      deadline: input.deadline,
      totalPages,
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
        progress: progressMap[status],
      };
    }).map((page, index) => ({
      ...page,
      pageNumber: index + 1,
    }));

    project.title = input.title;
    project.startDate = input.startDate;
    project.eventDate = input.eventDate;
    project.deadline = input.deadline;
    project.totalPages = totalPages;
    project.pages = nextPages;

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

    const previousProgress = page.progress;
    page.status = status;
    page.progress = progressMap[status];

    if (options.syncDailyActual && options.workDate) {
      const actualDelta = page.progress - previousProgress;
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
    updatePageStatus,
    updateDailyWorkEntry,
  };
};
