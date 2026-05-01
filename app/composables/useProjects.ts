import type { Project, PageStatus } from "~/types/project";
import { progressMap } from "~/composables/useProgress";
import { useState } from "#app";

const STORAGE_KEY = "doujin-progress-projects";

export const useProjects = () => {
  const projects = useState<Project[]>("projects", () => []);

  const loadProjects = () => {
    if (import.meta.server) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    projects.value = JSON.parse(saved);
  };

  const saveProjects = () => {
    if (import.meta.server) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value));
  };

  const createProject = (
    title: string,
    deadline: string,
    totalPages: number
  ) => {
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
      title,
      deadline,
      totalPages,
      pages,
      createdAt: new Date().toISOString(),
    };

    projects.value.push(project);
    saveProjects();

    return project;
  };

  const getProjectById = (id: string) => {
    return projects.value.find((project) => project.id === id);
  };

  const updatePageStatus = (
    projectId: string,
    pageNumber: number,
    status: PageStatus
  ) => {
    const project = getProjectById(projectId);
    if (!project) return;

    const page = project.pages.find((p) => p.pageNumber === pageNumber);
    if (!page) return;

    page.status = status;
    page.progress = progressMap[status];

    saveProjects();
  };

  return {
    projects,
    loadProjects,
    saveProjects,
    createProject,
    getProjectById,
    updatePageStatus,
  };
};