import type {
  AppSettings,
  CrunchThresholds,
  WorkProcess,
  WorkProcessStep,
} from "~/types/settings";

export const DEFAULT_WORK_STEPS: WorkProcessStep[] = [
  { name: "ネーム", minutesPerPage: 60 },
  { name: "下描き", minutesPerPage: 60 },
  { name: "ペン入れ", minutesPerPage: 60 },
  { name: "仕上げ", minutesPerPage: 60 },
  { name: "完成", minutesPerPage: 60 },
];

export const DEFAULT_WORK_PROCESS: WorkProcess = {
  id: "manga",
  name: "漫画",
  steps: DEFAULT_WORK_STEPS,
};

export const DEFAULT_CRUNCH_THRESHOLDS: CrunchThresholds = {
  warningMinutes: 120,
  crunchMinutes: 180,
  extremeMinutes: 360,
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultTotalPages: 16,
  defaultWorkProcessId: DEFAULT_WORK_PROCESS.id,
  workProcesses: [DEFAULT_WORK_PROCESS],
  crunchThresholds: DEFAULT_CRUNCH_THRESHOLDS,
};
