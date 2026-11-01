import type { Ref } from "vue";
import type { DailyWorkEntry, Project } from "~~/types/project";
import { useProgress } from "~/composables/useProgress";
import { useProjects } from "~/composables/useProjects";
import { formatDateKey } from "~/utils/planAllocation";

// 選択中の日の予定について、上限計算と保存、保存後の通知を管理する。
export const useDailyPlan = (selectedDate: Ref<string>) => {
  const {
    projects,
    updateDailyWorkEntry,
    replacePlannedEntries,
    getProjectDailyActualMinutes,
  } = useProjects();
  const { calculateRemainingWork } = useProgress();

  // 上限に丸めた入力だけ、丸めた後の値をプロジェクト別に表示する。
  const plannedClampNotices = ref<Record<string, number>>({});
  const allocationDoneNotices = ref<Record<string, boolean>>({});

  watch(selectedDate, () => {
    plannedClampNotices.value = {};
    allocationDoneNotices.value = {};
  });

  const dailyEntry = (projectId: string): DailyWorkEntry => {
    const project = projects.value.find((item) => item.id === projectId);

    return project?.dailyWorkEntries[selectedDate.value] ?? {
      planned: 0,
      actual: 0,
    };
  };

  const dailyActual = (projectId: string) => {
    return getProjectDailyActualMinutes(projectId, selectedDate.value);
  };

  const projectRequiredWork = (project: Project) => {
    return calculateRemainingWork(project.pages, project.workProcessSteps);
  };

  const plannedLoad = (project: Project, dateKey: string, planned: number) => {
    const todayKey = formatDateKey(new Date());
    // 過去日の予定は残作業時間とは無関係なので、割り振り済みとして数えない。
    if (dateKey < todayKey) return 0;
    // 今日はすでに進めた分が残作業時間から減っているため、その分を予定から差し引く。
    if (dateKey === todayKey) {
      return Math.max(planned - getProjectDailyActualMinutes(project.id, dateKey), 0);
    }

    return planned;
  };

  const projectPlannedTotal = (project: Project) => {
    // 予定の割り振り過ぎを防ぐため、残作業時間に対応する今日以降の予定だけを集計する。
    return Object.entries(project.dailyWorkEntries).reduce((sum, [dateKey, entry]) => {
      return sum + plannedLoad(project, dateKey, entry.planned);
    }, 0);
  };

  const maxPlannedEntry = (projectId: string) => {
    const project = projects.value.find((item) => item.id === projectId);
    if (!project) return 0;

    const dateKey = selectedDate.value;
    const current = dailyEntry(projectId);
    const otherPlanned = projectPlannedTotal(project) - plannedLoad(project, dateKey, current.planned);
    const available = Math.max(projectRequiredWork(project) - otherPlanned, 0);
    const todayKey = formatDateKey(new Date());

    // 過去日は入力済みの予定を削らないようにし、今日は進めた分を上乗せして入力できるようにする。
    if (dateKey < todayKey) return Math.max(current.planned, available);
    if (dateKey === todayKey) return available + dailyActual(projectId);

    return available;
  };

  const savePlannedEntry = (projectId: string, minutes: number) => {
    const current = dailyEntry(projectId);
    const requested = Math.max(0, Math.round(Number.isFinite(minutes) ? minutes : 0));
    const planned = Math.min(requested, maxPlannedEntry(projectId));

    if (planned < requested) {
      plannedClampNotices.value[projectId] = planned;
    } else {
      delete plannedClampNotices.value[projectId];
    }

    if (planned === current.planned) return;

    updateDailyWorkEntry(projectId, selectedDate.value, {
      ...current,
      planned,
    });
  };

  const adjustPlannedEntry = (projectId: string, amount: number) => {
    savePlannedEntry(projectId, dailyEntry(projectId).planned + amount);
  };

  const clearAllocationDone = (projectId: string) => {
    delete allocationDoneNotices.value[projectId];
  };

  const applyAllocation = (projectId: string, plannedByDate: Record<string, number>) => {
    // 今日以降の予定（締切後も含む）をまとめて置き換え、残り作業時間の上限を超えないようにする。
    replacePlannedEntries(projectId, formatDateKey(new Date()), plannedByDate);
    delete plannedClampNotices.value[projectId];
    allocationDoneNotices.value[projectId] = true;
  };

  return {
    plannedClampNotices,
    allocationDoneNotices,
    dailyEntry,
    dailyActual,
    adjustPlannedEntry,
    clearAllocationDone,
    applyAllocation,
  };
};
