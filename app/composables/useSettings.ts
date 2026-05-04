import type { AppSettings, WorkProcess, WorkProcessStep } from "~/types/settings";
import { useState } from "#app";

const STORAGE_KEY = "doujin-progress-settings";

export const DEFAULT_WORK_PROCESS: WorkProcess = {
  id: "manga",
  name: "漫画",
  steps: [
    { name: "ネーム", minutesPerPage: 60 },
    { name: "下描き", minutesPerPage: 60 },
    { name: "ペン入れ", minutesPerPage: 60 },
    { name: "仕上げ", minutesPerPage: 60 },
    { name: "完成", minutesPerPage: 60 },
  ],
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultTotalPages: 16,
  defaultWorkProcessId: DEFAULT_WORK_PROCESS.id,
  workProcesses: [DEFAULT_WORK_PROCESS],
};

const createId = () => {
  if (import.meta.client && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `work-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const normalizeSteps = (
  steps: Array<string | Partial<WorkProcessStep>> | undefined,
  fallbackMinutes = 60
) => {
  const normalized = (steps ?? []).reduce<WorkProcessStep[]>((result, step) => {
    const name = typeof step === "string" ? step.trim() : String(step.name ?? "").trim();
    if (!name || result.some((item) => item.name === name)) return result;

    const minutesPerPage = typeof step === "string"
      ? fallbackMinutes
      : Math.max(1, Math.round(Number(step.minutesPerPage) || fallbackMinutes));

    result.push({ name, minutesPerPage });
    return result;
  }, []);

  return normalized.length > 0
    ? normalized
    : DEFAULT_WORK_PROCESS.steps.map((step) => ({ ...step }));
};

const normalizeWorkProcesses = (processes: WorkProcess[] | undefined) => {
  const normalized = (processes ?? []).map((process) => ({
    id: process.id || createId(),
    name: process.name.trim() || "名称未設定",
    steps: normalizeSteps(process.steps, 60),
  }));
  const hasDefault = normalized.some((process) => process.id === DEFAULT_WORK_PROCESS.id);

  return hasDefault ? normalized : [DEFAULT_WORK_PROCESS, ...normalized];
};

const normalizeSettings = (settings: Partial<AppSettings> = {}): AppSettings => {
  const workProcesses = normalizeWorkProcesses(settings.workProcesses);
  const defaultWorkProcessId = workProcesses.some(
    (process) => process.id === settings.defaultWorkProcessId
  )
    ? String(settings.defaultWorkProcessId)
    : workProcesses[0].id;

  return {
    defaultTotalPages: Math.max(
      1,
      Math.round(Number(settings.defaultTotalPages) || DEFAULT_SETTINGS.defaultTotalPages)
    ),
    defaultWorkProcessId,
    workProcesses,
  };
};

export const useSettings = () => {
  const settings = useState<AppSettings>("settings", () => ({ ...DEFAULT_SETTINGS }));

  const loadSettings = () => {
    if (import.meta.server) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    settings.value = normalizeSettings(JSON.parse(saved));
  };

  const saveSettings = (input: Partial<AppSettings>) => {
    settings.value = normalizeSettings(input);

    if (import.meta.server) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
  };

  const resetSettings = () => {
    settings.value = {
      ...DEFAULT_SETTINGS,
      workProcesses: DEFAULT_SETTINGS.workProcesses.map((process) => ({
        ...process,
        steps: process.steps.map((step) => ({ ...step })),
      })),
    };

    if (import.meta.server) return;

    localStorage.removeItem(STORAGE_KEY);
  };

  const saveWorkProcess = (input: { id?: string; name: string; steps: WorkProcessStep[] }) => {
    const process: WorkProcess = {
      id: input.id || createId(),
      name: input.name.trim() || "名称未設定",
      steps: normalizeSteps(input.steps),
    };
    const nextProcesses = settings.value.workProcesses.some((item) => item.id === process.id)
      ? settings.value.workProcesses.map((item) => (item.id === process.id ? process : item))
      : [...settings.value.workProcesses, process];

    saveSettings({
      ...settings.value,
      workProcesses: nextProcesses,
      defaultWorkProcessId: settings.value.defaultWorkProcessId || process.id,
    });

    return process;
  };

  const deleteWorkProcess = (processId: string) => {
    if (settings.value.workProcesses.length <= 1) return false;

    const nextProcesses = settings.value.workProcesses.filter(
      (process) => process.id !== processId
    );
    if (nextProcesses.length === settings.value.workProcesses.length) return false;

    saveSettings({
      ...settings.value,
      workProcesses: nextProcesses,
      defaultWorkProcessId:
        settings.value.defaultWorkProcessId === processId
          ? nextProcesses[0].id
          : settings.value.defaultWorkProcessId,
    });

    return true;
  };

  const getWorkProcessById = (processId: string) => {
    return settings.value.workProcesses.find((process) => process.id === processId);
  };

  return {
    settings,
    loadSettings,
    saveSettings,
    resetSettings,
    saveWorkProcess,
    deleteWorkProcess,
    getWorkProcessById,
  };
};
