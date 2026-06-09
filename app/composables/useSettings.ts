import type {
  AppSettings,
  CrunchThresholds,
  WorkProcess,
  WorkProcessStep,
} from "~/types/settings";
import {
  DEFAULT_CRUNCH_THRESHOLDS,
  DEFAULT_SETTINGS,
  DEFAULT_WORK_PROCESS,
} from "~/constants/defaultSettings";
import { useState } from "#app";
import {
  loadRemoteSettings,
  saveRemoteSettings,
} from "~/repositories/settingsRepository";

const STORAGE_KEY_PREFIX = "doujin-progress-settings";

let remoteSettingsWriteQueue: Promise<void> = Promise.resolve();

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

const normalizeCrunchThresholds = (
  thresholds: Partial<CrunchThresholds> | undefined
): CrunchThresholds => {
  const warningMinutes = Math.max(
    1,
    Math.round(Number(thresholds?.warningMinutes) || DEFAULT_CRUNCH_THRESHOLDS.warningMinutes)
  );
  const crunchMinutes = Math.max(
    warningMinutes + 1,
    Math.round(Number(thresholds?.crunchMinutes) || DEFAULT_CRUNCH_THRESHOLDS.crunchMinutes)
  );
  const extremeMinutes = Math.max(
    crunchMinutes + 1,
    Math.round(Number(thresholds?.extremeMinutes) || DEFAULT_CRUNCH_THRESHOLDS.extremeMinutes)
  );

  return {
    warningMinutes,
    crunchMinutes,
    extremeMinutes,
  };
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
    crunchThresholds: normalizeCrunchThresholds(settings.crunchThresholds),
  };
};

const cloneDefaultSettings = (): AppSettings => ({
  ...DEFAULT_SETTINGS,
  workProcesses: DEFAULT_SETTINGS.workProcesses.map((process) => ({
    ...process,
    steps: process.steps.map((step) => ({ ...step })),
  })),
});

const localStorageKey = (uid: string) => `${STORAGE_KEY_PREFIX}:${uid}`;

const readLocalSettings = (uid: string) => {
  if (import.meta.server) return null;

  const saved = localStorage.getItem(localStorageKey(uid));
  if (!saved) return null;

  return normalizeSettings(JSON.parse(saved));
};

const writeLocalSettings = (uid: string | undefined, settings: AppSettings) => {
  if (import.meta.server) return;
  if (!uid) return;

  localStorage.setItem(localStorageKey(uid), JSON.stringify(settings));
};

const cloneSettings = (settings: AppSettings): AppSettings => {
  return {
    ...settings,
    workProcesses: settings.workProcesses.map((process) => ({
      ...process,
      steps: process.steps.map((step) => ({ ...step })),
    })),
    crunchThresholds: { ...settings.crunchThresholds },
  };
};

type SaveWorkProcessInput = {
  id?: string;
  name: string;
  steps: WorkProcessStep[];
  syncProjects?: boolean;
};

export const useSettings = () => {
  const settings = useState<AppSettings>("settings", () => cloneDefaultSettings());
  const isSettingsLoading = useState("settings-loading", () => false);
  const settingsError = useState<string>("settings-error", () => "");
  const { ensureAuthenticated, user: authUser } = useFirebaseAuth();

  const enqueueRemoteWrite = (
    write: () => Promise<void>,
    failureMessage = "設定の保存に失敗しました。"
  ) => {
    if (import.meta.server) return Promise.resolve();

    remoteSettingsWriteQueue = remoteSettingsWriteQueue
      .catch(() => undefined)
      .then(write)
      .then(() => {
        settingsError.value = "";
      })
      .catch((error) => {
        settingsError.value = error instanceof Error ? error.message : failureMessage;
      });

    return remoteSettingsWriteQueue;
  };

  const persistSettings = () => {
    const settingsSnapshot = cloneSettings(settings.value);

    return enqueueRemoteWrite(async () => {
      const user = await ensureAuthenticated();
      if (!user) return;

      const { $firestore } = useNuxtApp();
      await saveRemoteSettings($firestore, user.uid, settingsSnapshot);
    });
  };

  const loadSettings = () => {
    if (import.meta.server) return Promise.resolve();

    return (async () => {
      isSettingsLoading.value = true;

      try {
        const user = await ensureAuthenticated();
        if (!user) return;

        const localSettings = readLocalSettings(user.uid);
        settings.value = localSettings ?? cloneDefaultSettings();

        const { $firestore } = useNuxtApp();
        const remoteSettings = await loadRemoteSettings($firestore, user.uid);

        if (remoteSettings) {
          settings.value = normalizeSettings(remoteSettings);
          writeLocalSettings(user.uid, settings.value);
        } else {
          await persistSettings();
        }

        settingsError.value = "";
      } catch (error) {
        settingsError.value = error instanceof Error ? error.message : "設定の読み込みに失敗しました。";
      } finally {
        isSettingsLoading.value = false;
      }
    })();
  };

  const saveSettings = (input: Partial<AppSettings>) => {
    settings.value = normalizeSettings(input);
    writeLocalSettings(authUser.value?.uid, settings.value);

    void persistSettings();
  };

  const saveWorkProcess = (input: SaveWorkProcessInput) => {
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

    if (input.syncProjects !== false) {
      useProjects().applyWorkProcessToProjects(process);
    }

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
    isSettingsLoading,
    settingsError,
    loadSettings,
    saveSettings,
    saveWorkProcess,
    deleteWorkProcess,
    getWorkProcessById,
  };
};
