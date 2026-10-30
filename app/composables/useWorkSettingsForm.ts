import type { InjectionKey } from "vue";
import type { WorkProcess, WorkProcessStep } from "~/types/settings";
import {
  DEFAULT_CRUNCH_THRESHOLDS,
  DEFAULT_SETTINGS,
} from "~/constants/defaultSettings";

// 作業カスタム画面のフォーム状態と保存処理。
// スマホ用とPC用で同じ入力内容を共有するため、ページで1回だけ作って provide する。
export const useWorkSettingsForm = () => {
  const {
    settings,
    saveSettings,
    saveWorkProcess,
    deleteWorkProcess,
  } = useSettings();

  const defaultTotalPages = ref(settings.value.defaultTotalPages);
  const crunchThresholds = reactive({ ...settings.value.crunchThresholds });
  const editingWorkProcessId = ref("");
  const workProcessName = ref("");
  const workProcessSteps = ref<WorkProcessStep[]>([
    { name: "", minutesPerPage: 60 },
  ]);
  const savedMessage = ref("");
  const isConfirmingReset = ref(false);

  const crunchThresholdError = computed(() => {
    const warning = Math.round(Number(crunchThresholds.warningMinutes) || 0);
    const crunch = Math.round(Number(crunchThresholds.crunchMinutes) || 0);
    const extreme = Math.round(Number(crunchThresholds.extremeMinutes) || 0);

    if (warning < 1 || crunch < 1 || extreme < 1) {
      return "修羅場メーターの値は1分以上で設定してください。";
    }

    if (!(warning < crunch && crunch < extreme)) {
      return "一歩手前、修羅場、限界修羅場の順に大きい数値を設定してください。";
    }

    return "";
  });

  const syncForm = () => {
    defaultTotalPages.value = settings.value.defaultTotalPages;
    crunchThresholds.warningMinutes = settings.value.crunchThresholds.warningMinutes;
    crunchThresholds.crunchMinutes = settings.value.crunchThresholds.crunchMinutes;
    crunchThresholds.extremeMinutes = settings.value.crunchThresholds.extremeMinutes;
  };

  const resetWorkProcessForm = () => {
    editingWorkProcessId.value = "";
    workProcessName.value = "";
    workProcessSteps.value = [{ name: "", minutesPerPage: 60 }];
  };

  const handleSubmit = () => {
    if (crunchThresholdError.value) return;

    saveSettings({
      ...settings.value,
      defaultTotalPages: defaultTotalPages.value,
      crunchThresholds: { ...crunchThresholds },
    });
    syncForm();
    savedMessage.value = "設定を保存しました。";
  };

  const openResetConfirm = () => {
    isConfirmingReset.value = true;
  };

  const closeResetConfirm = () => {
    isConfirmingReset.value = false;
  };

  const handleReset = () => {
    saveSettings({
      ...settings.value,
      defaultTotalPages: DEFAULT_SETTINGS.defaultTotalPages,
      crunchThresholds: { ...DEFAULT_CRUNCH_THRESHOLDS },
    });
    syncForm();
    closeResetConfirm();
    savedMessage.value = "初期値に戻しました。";
  };

  const editWorkProcess = (process: WorkProcess) => {
    editingWorkProcessId.value = process.id;
    workProcessName.value = process.name;
    workProcessSteps.value = process.steps.map((step) => ({ ...step }));
  };

  const addWorkProcessStep = () => {
    workProcessSteps.value.push({ name: "", minutesPerPage: 60 });
  };

  const removeWorkProcessStep = (index: number) => {
    if (workProcessSteps.value.length <= 1) return;

    workProcessSteps.value.splice(index, 1);
  };

  const handleSaveWorkProcess = () => {
    const process = saveWorkProcess({
      id: editingWorkProcessId.value || undefined,
      name: workProcessName.value,
      steps: workProcessSteps.value,
    });

    editWorkProcess(process);
    savedMessage.value = "作業工程を保存しました。";
  };

  const setDefaultWorkProcess = (processId: string) => {
    saveSettings({
      ...settings.value,
      defaultWorkProcessId: processId,
    });
    savedMessage.value = "既定の作業工程を変更しました。";
  };

  const handleDeleteWorkProcess = (processId: string) => {
    const deleted = deleteWorkProcess(processId);
    if (!deleted) return;

    if (editingWorkProcessId.value === processId) {
      resetWorkProcessForm();
    }
    savedMessage.value = "作業工程を削除しました。";
  };

  return {
    settings,
    defaultTotalPages,
    crunchThresholds,
    editingWorkProcessId,
    workProcessName,
    workProcessSteps,
    savedMessage,
    isConfirmingReset,
    crunchThresholdError,
    syncForm,
    resetWorkProcessForm,
    handleSubmit,
    openResetConfirm,
    closeResetConfirm,
    handleReset,
    editWorkProcess,
    addWorkProcessStep,
    removeWorkProcessStep,
    handleSaveWorkProcess,
    setDefaultWorkProcess,
    handleDeleteWorkProcess,
  };
};

export type WorkSettingsForm = ReturnType<typeof useWorkSettingsForm>;

export const workSettingsFormKey: InjectionKey<WorkSettingsForm> = Symbol("workSettingsForm");

export const useWorkSettingsFormContext = () => {
  const form = inject(workSettingsFormKey);
  if (!form) {
    throw new Error("useWorkSettingsForm が provide されていません。");
  }

  return form;
};
