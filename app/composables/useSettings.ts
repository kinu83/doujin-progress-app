import type { AppSettings } from "~/types/settings";
import { useState } from "#app";

const STORAGE_KEY = "doujin-progress-settings";

export const DEFAULT_SETTINGS: AppSettings = {
  defaultStepMinutes: 60,
  defaultTotalPages: 16,
};

const normalizeSettings = (settings: Partial<AppSettings> = {}): AppSettings => {
  return {
    defaultStepMinutes: Math.max(
      1,
      Math.round(Number(settings.defaultStepMinutes) || DEFAULT_SETTINGS.defaultStepMinutes)
    ),
    defaultTotalPages: Math.max(
      1,
      Math.round(Number(settings.defaultTotalPages) || DEFAULT_SETTINGS.defaultTotalPages)
    ),
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
    settings.value = { ...DEFAULT_SETTINGS };

    if (import.meta.server) return;

    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    settings,
    loadSettings,
    saveSettings,
    resetSettings,
  };
};
