import type { BookSpec, DailyWorkEntry, PageStatus, Project, WorkLog } from "~~/types/project";
import type { WorkProcessStep } from "~~/types/settings";
import { DEFAULT_WORK_PROCESS } from "~/constants/defaultSettings";

export const defaultBookSpec = (): BookSpec => ({
  colorMode: "モノクロ",
  coverPaper: "",
  bodyPaper: "",
  printer: "",
  printRun: 0,
  budget: 0,
  note: "",
});

const normalizeDailyWorkEntries = (
  entries: Record<string, DailyWorkEntry> | undefined,
  shouldMigrateFromLegacyWorkUnits: boolean
) => {
  return Object.fromEntries(
    Object.entries(entries ?? {}).map(([date, entry]) => {
      // 旧progressベースのデータは1単位を20分として保存していたため、分単位へ寄せる。
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

const normalizeWorkLogs = (
  logs: WorkLog[] | undefined,
  projectId: string
) => {
  return (logs ?? []).reduce<WorkLog[]>((result, log) => {
    // 日付がないログは集計できないため、読み込み時に捨てる。
    const workDate = String(log.workDate ?? "");
    if (!workDate) return result;

    const now = new Date().toISOString();
    const id = String(log.id || crypto.randomUUID());

    result.push({
      id,
      projectId,
      workDate,
      kind: log.kind ?? "manualActual",
      minutes: Math.round(Number(log.minutes) || 0),
      pageNumber: log.pageNumber === undefined
        ? undefined
        : Math.max(1, Math.round(Number(log.pageNumber) || 1)),
      fromStatus: log.fromStatus,
      toStatus: log.toStatus,
      note: log.note,
      createdAt: log.createdAt ?? now,
      updatedAt: log.updatedAt ?? log.createdAt ?? now,
    });

    return result;
  }, []);
};

const createLegacyActualWorkLogs = (
  projectId: string,
  entries: Record<string, DailyWorkEntry>,
  existingLogs: WorkLog[]
) => {
  return Object.entries(entries).reduce<WorkLog[]>((result, [date, entry]) => {
    const actual = Math.max(0, Math.round(Number(entry.actual) || 0));
    if (actual === 0) return result;

    const hasLogForDate = existingLogs.some((log) => log.workDate === date);
    if (hasLogForDate) return result;

    // 実績ログ導入前のactualも、以後は同じ集計経路で扱えるようにログ化する。
    const now = new Date().toISOString();
    result.push({
      id: `legacy-actual-${date}`,
      projectId,
      workDate: date,
      kind: "legacyActual",
      minutes: actual,
      note: "dailyWorkEntries.actual から移行",
      createdAt: now,
      updatedAt: now,
    });

    return result;
  }, []);
};

const normalizeProjectSteps = (
  steps: Array<string | Partial<WorkProcessStep>> | undefined
) => {
  const normalized = (steps ?? []).reduce<WorkProcessStep[]>((result, step) => {
    const name = typeof step === "string" ? step.trim() : String(step.name ?? "").trim();
    // 同名工程はステータス判定が曖昧になるので、最初の1件だけを採用する。
    if (!name || result.some((item) => item.name === name)) return result;

    const minutesPerPage = typeof step === "string"
      ? 60
      : Math.max(1, Math.round(Number(step.minutesPerPage) || 60));

    result.push({ name, minutesPerPage });
    return result;
  }, []);

  return normalized.length > 0
    ? normalized
    : DEFAULT_WORK_PROCESS.steps.map((step) => ({ ...step }));
};

const getProjectStatusList = (steps: WorkProcessStep[]) => [
  "未着手",
  ...steps.map((step) => step.name),
];

export const normalizeStatusForSteps = (
  status: PageStatus,
  previousSteps: WorkProcessStep[],
  nextSteps: WorkProcessStep[]
): PageStatus => {
  const nextStatuses = getProjectStatusList(nextSteps);
  if (nextStatuses.includes(status)) return status;

  const previousStatuses = getProjectStatusList(previousSteps);
  const previousIndex = previousStatuses.indexOf(status);
  // 旧工程で完了済みだったページは、新工程でも最後の工程に移して完了扱いを保つ。
  if (previousIndex === previousStatuses.length - 1) {
    return nextStatuses.at(-1) ?? "未着手";
  }

  return "未着手";
};

export const resizePages = (
  pages: Project["pages"],
  totalPages: number,
  normalizeStatus: (status: PageStatus) => PageStatus = (status) => status
) => {
  // ページ数変更時は既存ページの進捗を可能な限り維持し、足りない分だけ未着手で作る。
  return Array.from({ length: totalPages }, (_, index) => {
    return pages[index] ?? {
      pageNumber: index + 1,
      status: "未着手",
    };
  }).map((page, index) => ({
    ...page,
    pageNumber: index + 1,
    status: normalizeStatus(page.status),
  }));
};

export const normalizeProject = (project: Project): Project => {
  const pages = project.pages ?? [];
  // progressフィールドを持つデータは旧形式として扱い、作業時間単位も移行する。
  const hasLegacyProgress = pages.some((page) => "progress" in page);
  const projectId = project.id || crypto.randomUUID();
  const dailyWorkEntries = normalizeDailyWorkEntries(
    project.dailyWorkEntries,
    hasLegacyProgress
  );
  const workLogs = normalizeWorkLogs(project.workLogs, projectId);
  const processFields = {
    workProcessId: project.workProcessId ?? DEFAULT_WORK_PROCESS.id,
    workProcessName: project.workProcessName ?? DEFAULT_WORK_PROCESS.name,
    workProcessSteps: normalizeProjectSteps(project.workProcessSteps),
  };

  return {
    ...project,
    id: projectId,
    eventName: project.eventName ?? "",
    startDate: project.startDate ?? "",
    eventDate: project.eventDate ?? "",
    totalPages: Math.max(1, Number(project.totalPages) || pages.length || 1),
    createdAt: project.createdAt ?? new Date().toISOString(),
    ...processFields,
    bookSpec: {
      ...defaultBookSpec(),
      ...(project.bookSpec ?? {}),
    },
    pages: pages.map((page, index) => ({
      pageNumber: page.pageNumber ?? index + 1,
      status: page.status ?? "未着手",
    })),
    dailyWorkEntries,
    workLogs: [
      ...workLogs,
      ...createLegacyActualWorkLogs(projectId, dailyWorkEntries, workLogs),
    ],
  };
};
