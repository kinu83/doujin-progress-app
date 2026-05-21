import type { BookSpec, DailyWorkEntry, Project, PageStatus, WorkLog } from "~/types/project";
import type { WorkProcess, WorkProcessStep } from "~/types/settings";
import { calculateStatusCompletedMinutes } from "~/composables/useProgress";
import { DEFAULT_WORK_PROCESS } from "~/constants/defaultSettings";
import { useSettings } from "~/composables/useSettings";
import { useState } from "#app";
import {
  deleteRemoteProject,
  deleteRemoteWorkLog,
  loadRemoteProjects,
  saveRemoteProject,
  saveRemoteProjects,
  saveRemoteWorkLog,
} from "~/repositories/projectRepository";

const STORAGE_KEY = "doujin-progress-projects";

type ProjectInfoInput = {
  eventName: string;
  title: string;
  startDate: string;
  eventDate: string;
  deadline: string;
  totalPages: number;
  workProcessId: string;
};

type BookSpecInput = BookSpec & {
  totalPages: number;
};

type CreateProjectInput = {
  eventName?: string;
  title: string;
  startDate?: string;
  eventDate?: string;
  deadline: string;
  totalPages: number;
  workProcessId?: string;
};

type UpdatePageStatusOptions = {
  workDate?: string;
  syncDailyActual?: boolean;
};

type ManualActualUpdateResult = {
  project: Project;
  workLog?: WorkLog;
  deletedWorkLog?: WorkLog;
};

let remoteProjectWriteQueue: Promise<void> = Promise.resolve();

const defaultBookSpec = (): BookSpec => ({
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

const sumWorkLogMinutes = (logs: WorkLog[]) => {
  return Math.max(
    0,
    logs.reduce((sum, log) => sum + Math.round(Number(log.minutes) || 0), 0)
  );
};

const hasWorkLogsForDate = (project: Project, date: string) => {
  return project.workLogs.some((log) => log.workDate === date);
};

const getActualMinutesFromLogs = (project: Project, date: string) => {
  return sumWorkLogMinutes(project.workLogs.filter((log) => log.workDate === date));
};

const getDailyActualMinutes = (project: Project, date: string) => {
  // ログがある日はログを正とし、旧dailyWorkEntries.actualは後方互換のフォールバックにする。
  if (hasWorkLogsForDate(project, date)) {
    return getActualMinutesFromLogs(project, date);
  }

  return Math.max(0, Number(project.dailyWorkEntries[date]?.actual) || 0);
};

const refreshDailyActualCache = (project: Project, date: string) => {
  const current = project.dailyWorkEntries[date] ?? {
    planned: 0,
    actual: 0,
  };
  const actual = getActualMinutesFromLogs(project, date);

  // dailyWorkEntriesはカレンダー表示用の軽いキャッシュなので、空なら持たない。
  if (current.planned === 0 && actual === 0) {
    delete project.dailyWorkEntries[date];
    return;
  }

  project.dailyWorkEntries[date] = {
    planned: current.planned,
    actual,
  };
};

const workProcessToProjectFields = (process: WorkProcess) => {
  return {
    workProcessId: process.id,
    workProcessName: process.name,
    workProcessSteps: process.steps.map((step) => ({ ...step })),
  };
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

const normalizeStatusForSteps = (
  status: PageStatus,
  previousSteps: WorkProcessStep[],
  nextSteps: WorkProcessStep[]
) => {
  const nextStatuses = getProjectStatusList(nextSteps);
  if (nextStatuses.includes(status)) return status;

  const previousStatuses = getProjectStatusList(previousSteps);
  const previousIndex = previousStatuses.indexOf(status);
  // 旧工程で完了済みだったページは、新工程でも最後の工程に移して完了扱いを保つ。
  if (previousIndex === previousStatuses.length - 1) {
    return nextStatuses[nextStatuses.length - 1];
  }

  return "未着手";
};

const resizePages = (
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

const normalizeProject = (project: Project): Project => {
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

const readLocalProjects = () => {
  if (import.meta.server) return null;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  return (JSON.parse(saved) as Project[]).map(normalizeProject);
};

const writeLocalProjects = (projects: Project[]) => {
  if (import.meta.server) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const cloneJson = <T>(value: T): T => {
  // Vueのリアクティブ参照をFirestore保存前に素のJSONへ落とす。
  return JSON.parse(JSON.stringify(value)) as T;
};

const cloneProject = (project: Project): Project => {
  return cloneJson(project);
};

export const useProjects = () => {
  const projects = useState<Project[]>("projects", () => []);
  const { settings, loadSettings, getWorkProcessById } = useSettings();
  const isProjectsLoading = useState("projects-loading", () => false);
  const projectsError = useState<string>("projects-error", () => "");
  const { ensureAuthenticated } = useFirebaseAuth();

  const enqueueRemoteWrite = (
    write: () => Promise<void>,
    failureMessage = "プロジェクトの保存に失敗しました。",
    rethrow = false
  ) => {
    if (import.meta.server) return Promise.resolve();

    // Firestoreへの連続保存は順序を崩さないように直列化する。
    remoteProjectWriteQueue = remoteProjectWriteQueue
      .catch(() => undefined)
      .then(write)
      .then(() => {
        projectsError.value = "";
      })
      .catch((error) => {
        projectsError.value = error instanceof Error ? error.message : failureMessage;
        if (rethrow) {
          throw error;
        }
      });

    return remoteProjectWriteQueue;
  };

  const persistProjects = () => {
    const projectSnapshots = projects.value.map(cloneProject);

    return enqueueRemoteWrite(async () => {
      const user = await ensureAuthenticated();
      if (!user) return;

      const { $firestore } = useNuxtApp();
      await saveRemoteProjects($firestore, user.uid, projectSnapshots);
    });
  };

  const persistProject = (project: Project, rethrow = false) => {
    const projectSnapshot = cloneProject(project);

    return enqueueRemoteWrite(async () => {
      const user = await ensureAuthenticated();
      if (!user) return;

      const { $firestore } = useNuxtApp();
      await saveRemoteProject($firestore, user.uid, projectSnapshot);
    }, "プロジェクトの保存に失敗しました。", rethrow);
  };

  const persistWorkLog = (workLog: WorkLog) => {
    const workLogSnapshot = cloneJson(workLog);

    return enqueueRemoteWrite(async () => {
      const user = await ensureAuthenticated();
      if (!user) return;

      const { $firestore } = useNuxtApp();
      await saveRemoteWorkLog($firestore, user.uid, workLogSnapshot);
    }, "作業履歴の保存に失敗しました。");
  };

  const persistWorkLogDelete = (workLog: WorkLog) => {
    const workLogSnapshot = cloneJson(workLog);

    return enqueueRemoteWrite(async () => {
      const user = await ensureAuthenticated();
      if (!user) return;

      const { $firestore } = useNuxtApp();
      await deleteRemoteWorkLog(
        $firestore,
        user.uid,
        workLogSnapshot.projectId,
        workLogSnapshot.id
      );
    }, "作業履歴の削除に失敗しました。");
  };

  const persistProjectDeletes = (projectIds: string[], rethrow = false) => {
    return enqueueRemoteWrite(async () => {
      const user = await ensureAuthenticated();
      if (!user) return;

      const { $firestore } = useNuxtApp();
      await Promise.all(
        projectIds.map((projectId) => deleteRemoteProject($firestore, user.uid, projectId))
      );
    }, "プロジェクトの削除に失敗しました。", rethrow);
  };

  const loadProjects = () => {
    if (import.meta.server) return Promise.resolve();

    const localProjects = readLocalProjects();
    if (localProjects) {
      projects.value = localProjects;
    }

    return (async () => {
      isProjectsLoading.value = true;

      try {
        await loadSettings();

        const user = await ensureAuthenticated();
        if (!user) return;

        const { $firestore } = useNuxtApp();
        const remoteProjects = await loadRemoteProjects($firestore, user.uid);

        if (remoteProjects.length > 0) {
          projects.value = remoteProjects.map(normalizeProject);
          writeLocalProjects(projects.value);
          projects.value.forEach((project) => {
            // 読み込み時に作った移行ログは、次回以降もリモートで復元できるよう保存する。
            project.workLogs
              .filter((workLog) => workLog.kind === "legacyActual")
              .forEach((workLog) => {
                void persistWorkLog(workLog);
              });
          });
        } else if (projects.value.length > 0) {
          // 初回ログインなどでリモートが空なら、端末内の既存データを種として同期する。
          await persistProjects();
          projects.value.forEach((project) => {
            project.workLogs.forEach((workLog) => {
              void persistWorkLog(workLog);
            });
          });
        }

        projectsError.value = "";
      } catch (error) {
        projectsError.value = error instanceof Error ? error.message : "プロジェクトの読み込みに失敗しました。";
      } finally {
        isProjectsLoading.value = false;
      }
    })();
  };

  const saveProject = (project: Project) => {
    // 画面の即時反映はlocalStorage、永続同期は非同期でFirestoreへ送る。
    writeLocalProjects(projects.value);
    void persistProject(project);
  };

  const createProject = async (input: CreateProjectInput) => {
    loadSettings();
    // 指定がない場合は設定画面のデフォルト工程を使って新規プロジェクトを作る。
    const workProcess = input.workProcessId
      ? getWorkProcessById(input.workProcessId)
      : getWorkProcessById(settings.value.defaultWorkProcessId);
    const processFields = workProcessToProjectFields(workProcess ?? DEFAULT_WORK_PROCESS);
    const totalPages = Math.max(1, input.totalPages);
    const pages = Array.from({ length: totalPages }, (_, index) => {
      const status: PageStatus = "未着手";

      return {
        pageNumber: index + 1,
        status,
      };
    });

    const project: Project = {
      id: crypto.randomUUID(),
      eventName: input.eventName ?? "",
      title: input.title,
      startDate: input.startDate ?? "",
      eventDate: input.eventDate ?? "",
      deadline: input.deadline,
      totalPages,
      ...processFields,
      bookSpec: defaultBookSpec(),
      pages,
      dailyWorkEntries: {},
      workLogs: [],
      createdAt: new Date().toISOString(),
    };

    projects.value.push(project);
    writeLocalProjects(projects.value);

    try {
      await persistProject(project, true);
    } catch (error) {
      projects.value = projects.value.filter((item) => item.id !== project.id);
      writeLocalProjects(projects.value);
      throw error;
    }

    return project;
  };

  const getProjectById = (id: string) => {
    return projects.value.find((project) => project.id === id);
  };

  const deleteProject = async (projectId: string) => {
    const projectIndex = projects.value.findIndex(
      (project) => project.id === projectId
    );
    if (projectIndex === -1) return false;

    // 先にローカル状態から消し、リモート削除に失敗したら巻き戻す。
    const [deletedProject] = projects.value.splice(projectIndex, 1);
    if (!deletedProject) return false;

    writeLocalProjects(projects.value);

    try {
      await persistProjectDeletes([projectId], true);
    } catch (error) {
      projects.value.splice(projectIndex, 0, deletedProject);
      writeLocalProjects(projects.value);
      throw error;
    }

    return true;
  };

  const updateProjectInfo = (projectId: string, input: ProjectInfoInput) => {
    const project = getProjectById(projectId);
    if (!project) return false;

    if (input.startDate && input.deadline && input.startDate > input.deadline) {
      return false;
    }

    // 締切はイベント当日以前、作業開始日は締切以前という日付関係をここでも守る。
    if (input.deadline && input.eventDate && input.deadline > input.eventDate) {
      return false;
    }

    const totalPages = Math.max(1, input.totalPages);
    loadSettings();
    const workProcess = getWorkProcessById(input.workProcessId);
    // 設定から工程が消えていても、既存プロジェクトの工程で編集を継続できるようにする。
    const nextProcessFields = workProcessToProjectFields(workProcess ?? {
      id: project.workProcessId,
      name: project.workProcessName,
      steps: project.workProcessSteps,
    });
    const nextPages = resizePages(project.pages, totalPages, (status) => {
      return normalizeStatusForSteps(
        status,
        project.workProcessSteps,
        nextProcessFields.workProcessSteps
      );
    });

    project.eventName = input.eventName;
    project.title = input.title;
    project.startDate = input.startDate;
    project.eventDate = input.eventDate;
    project.deadline = input.deadline;
    project.totalPages = totalPages;
    project.workProcessId = nextProcessFields.workProcessId;
    project.workProcessName = nextProcessFields.workProcessName;
    project.workProcessSteps = nextProcessFields.workProcessSteps;
    project.pages = nextPages;

    saveProject(project);

    return true;
  };

  const updateBookSpec = (projectId: string, input: BookSpecInput) => {
    const project = getProjectById(projectId);
    if (!project) return false;

    const totalPages = Math.max(1, Number(input.totalPages) || 1);
    // 本の仕様からページ数を変えた場合も、ページ別進捗の配列を同時に揃える。
    const nextPages = resizePages(project.pages, totalPages);

    project.totalPages = totalPages;
    project.pages = nextPages;
    project.bookSpec = {
      colorMode: input.colorMode,
      coverPaper: input.coverPaper.trim(),
      bodyPaper: input.bodyPaper.trim(),
      printer: input.printer.trim(),
      printRun: Math.max(0, Number(input.printRun) || 0),
      budget: Math.max(0, Number(input.budget) || 0),
      note: input.note.trim(),
    };

    saveProject(project);

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

    loadSettings();

    const previousActualMinutes = calculateStatusCompletedMinutes(
      page.status,
      project.workProcessSteps
    );
    const previousStatus = page.status;
    page.status = status;

    let workLog: WorkLog | undefined;
    if (options.syncDailyActual && options.workDate) {
      // ページ進捗の差分だけをその日の実績として記録する。
      const actualDelta =
        calculateStatusCompletedMinutes(
          page.status,
          project.workProcessSteps
        ) - previousActualMinutes;
      applyDailyActualDelta(project, options.workDate, actualDelta);

      if (actualDelta !== 0) {
        const now = new Date().toISOString();
        workLog = {
          id: crypto.randomUUID(),
          projectId: project.id,
          workDate: options.workDate,
          kind: "pageStatus",
          minutes: actualDelta,
          pageNumber,
          fromStatus: previousStatus,
          toStatus: page.status,
          createdAt: now,
          updatedAt: now,
        };
        project.workLogs.push(workLog);
        refreshDailyActualCache(project, options.workDate);
      }
    }

    saveProject(project);
    if (workLog) {
      void persistWorkLog(workLog);
    }
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

    // 進捗を戻した場合でも日別実績はマイナスにせず、0分で止める。
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
    // 実績ログがある日は手入力値でログ集計を上書きしない。
    const actual = hasWorkLogsForDate(project, date)
      ? getActualMinutesFromLogs(project, date)
      : Math.max(0, Number(entry.actual) || 0);

    if (planned === 0 && actual === 0) {
      delete project.dailyWorkEntries[date];
    } else {
      project.dailyWorkEntries[date] = {
        planned,
        actual,
      };
    }

    saveProject(project);
  };

  const getProjectDailyActualMinutes = (projectId: string, date: string) => {
    const project = getProjectById(projectId);
    if (!project) return 0;

    return getDailyActualMinutes(project, date);
  };

  const getProjectManualActualMinutes = (projectId: string, date: string) => {
    const project = getProjectById(projectId);
    if (!project) return 0;

    return sumWorkLogMinutes(
      project.workLogs.filter((log) => {
        return log.workDate === date && ["manualActual", "legacyActual"].includes(log.kind);
      })
    );
  };

  const updateManualActualWorkLog = (
    projectId: string,
    date: string,
    minutes: number
  ): ManualActualUpdateResult | undefined => {
    const project = getProjectById(projectId);
    if (!project) return;

    const actual = Math.max(0, Math.round(Number(minutes) || 0));
    // 1日1件の手入力ログに寄せて、入力欄の値とログ集計が一対一になるようにする。
    const existingLog = project.workLogs.find((log) => {
      return log.workDate === date && ["manualActual", "legacyActual"].includes(log.kind);
    });

    let workLog: WorkLog | undefined;
    let deletedWorkLog: WorkLog | undefined;
    const now = new Date().toISOString();

    if (actual === 0 && existingLog) {
      // 0分入力は「手入力ログを消す」操作として扱う。
      deletedWorkLog = existingLog;
      project.workLogs = project.workLogs.filter((log) => log.id !== existingLog.id);
    } else if (actual > 0 && existingLog) {
      // 旧移行ログを編集した時点で、通常の手入力ログとして扱う。
      existingLog.kind = "manualActual";
      existingLog.minutes = actual;
      existingLog.updatedAt = now;
      workLog = existingLog;
    } else if (actual > 0) {
      workLog = {
        id: `manual-actual-${date}`,
        projectId,
        workDate: date,
        kind: "manualActual",
        minutes: actual,
        createdAt: now,
        updatedAt: now,
      };
      project.workLogs.push(workLog);
    }

    refreshDailyActualCache(project, date);
    saveProject(project);

    if (workLog) {
      void persistWorkLog(workLog);
    }

    if (deletedWorkLog) {
      void persistWorkLogDelete(deletedWorkLog);
    }

    return {
      project,
      workLog,
      deletedWorkLog,
    };
  };

  const applyWorkProcessToProjects = (process: WorkProcess) => {
    const updatedProjects: Project[] = [];

    projects.value.forEach((project) => {
      if (project.workProcessId !== process.id) return;

      // 設定画面で工程名や所要時間を変えたら、同じ工程を使う全プロジェクトへ反映する。
      const previousSteps = project.workProcessSteps;
      const nextProcessFields = workProcessToProjectFields(process);
      project.workProcessName = nextProcessFields.workProcessName;
      project.workProcessSteps = nextProcessFields.workProcessSteps;
      project.pages = project.pages.map((page) => ({
        ...page,
        status: normalizeStatusForSteps(
          page.status,
          previousSteps,
          nextProcessFields.workProcessSteps
        ),
      }));
      updatedProjects.push(project);
    });

    if (updatedProjects.length > 0) {
      writeLocalProjects(projects.value);
      updatedProjects.forEach((project) => {
        void persistProject(project);
      });
    }

    return updatedProjects.length > 0;
  };

  return {
    projects,
    isProjectsLoading,
    projectsError,
    loadProjects,
    createProject,
    getProjectById,
    deleteProject,
    updateProjectInfo,
    updateBookSpec,
    updatePageStatus,
    updateDailyWorkEntry,
    getProjectDailyActualMinutes,
    getProjectManualActualMinutes,
    updateManualActualWorkLog,
    applyWorkProcessToProjects,
  };
};
