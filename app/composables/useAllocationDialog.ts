import { useProgress } from "~/composables/useProgress";
import { useProjects } from "~/composables/useProjects";
import {
  buildAllocationPlan,
  formatDateKey,
  type AllocationOptions,
} from "~/utils/planAllocation";

type UseAllocationDialogOptions = {
  // 割り振りの完了通知と保存は useDailyPlan が持つ状態を使うため、呼び出し側から受け取る。
  clearAllocationDone: (projectId: string) => void;
  applyAllocation: (projectId: string, plannedByDate: Record<string, number>) => void;
};

// 自動割り振りダイアログの開閉、オプション、割り振り案の計算を管理する。
export const useAllocationDialog = ({
  clearAllocationDone,
  applyAllocation,
}: UseAllocationDialogOptions) => {
  const { projects, getProjectDailyActualMinutes } = useProjects();
  const { calculateRemainingWork } = useProgress();

  // 自動割り振りのオプションは保存せず、画面を開いている間だけプロジェクト別に保持する。
  const allocationOptions = ref<Record<string, AllocationOptions>>({});
  const allocationTargetId = ref<string | null>(null);

  const allocationTarget = computed(() => {
    return projects.value.find((project) => project.id === allocationTargetId.value) ?? null;
  });

  const allocationPlan = computed(() => {
    const project = allocationTarget.value;
    if (!project) return null;

    return buildAllocationPlan({
      project,
      options: allocationOptionsFor(project.id),
      remainingMinutes: calculateRemainingWork(project.pages, project.workProcessSteps),
      todayKey: formatDateKey(new Date()),
      getActualMinutes: (dateKey) => getProjectDailyActualMinutes(project.id, dateKey),
    });
  });

  function allocationOptionsFor(projectId: string): AllocationOptions {
    // 描画中に状態を書き換えないよう、初期化はダイアログを開いたときに行う。
    return allocationOptions.value[projectId] ?? {
      weekendWeight: 1,
      restDays: [],
    };
  }

  function updateAllocationOptions(projectId: string, options: AllocationOptions) {
    allocationOptions.value[projectId] = options;
  }

  function openAllocationDialog(projectId: string) {
    allocationOptions.value[projectId] ??= allocationOptionsFor(projectId);
    clearAllocationDone(projectId);
    allocationTargetId.value = projectId;
  }

  function closeAllocationDialog() {
    allocationTargetId.value = null;
  }

  function confirmAllocation() {
    const project = allocationTarget.value;
    const plan = allocationPlan.value;
    if (!project || !plan || plan.blockReason) return;

    applyAllocation(project.id, plan.plannedByDate);
    closeAllocationDialog();
  }

  return {
    allocationTarget,
    allocationPlan,
    allocationOptionsFor,
    updateAllocationOptions,
    openAllocationDialog,
    closeAllocationDialog,
    confirmAllocation,
  };
};
