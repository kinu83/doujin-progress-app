import type { ManuscriptPage, PageStatus } from "~/types/project";
import type { WorkProcessStep } from "~/types/settings";
import { DEFAULT_WORK_PROCESS } from "~/composables/useSettings";

export type CrunchLevelTone = "emerald" | "sky" | "amber" | "orange" | "red";

export type CrunchLevel = {
  label: string;
  tone: CrunchLevelTone;
  message: string;
  intensity: number;
};

export const createStatusList = (workSteps = DEFAULT_WORK_PROCESS.steps) => {
  return ["未着手", ...workSteps.map((step) => step.name)];
};

export const completedStepMap = Object.fromEntries(
  createStatusList().map((status, index) => [status, index])
) as Record<PageStatus, number>;

export const totalStepCount = DEFAULT_WORK_PROCESS.steps.length;

const getStatusIndex = (status: PageStatus, workSteps = DEFAULT_WORK_PROCESS.steps) => {
  const statuses = createStatusList(workSteps);
  const index = statuses.indexOf(status);

  return Math.max(0, index);
};

const getStepCount = (workSteps = DEFAULT_WORK_PROCESS.steps) => {
  return Math.max(workSteps.length, 1);
};

const getTotalStepMinutes = (workSteps = DEFAULT_WORK_PROCESS.steps) => {
  return workSteps.reduce((sum, step) => sum + step.minutesPerPage, 0);
};

const getCompletedStepMinutes = (
  status: PageStatus,
  workSteps = DEFAULT_WORK_PROCESS.steps
) => {
  return workSteps.slice(0, getStatusIndex(status, workSteps)).reduce((sum, step) => {
    return sum + step.minutesPerPage;
  }, 0);
};

export const calculatePageProgress = (
  page: ManuscriptPage,
  workSteps = DEFAULT_WORK_PROCESS.steps
) => {
  return Math.round((getStatusIndex(page.status, workSteps) / getStepCount(workSteps)) * 100);
};

export const calculateStatusCompletedMinutes = (
  status: PageStatus,
  workSteps = DEFAULT_WORK_PROCESS.steps
) => {
  return getCompletedStepMinutes(status, workSteps);
};

export const useProgress = () => {
  const workToMinutes = (work: number) => {
    return Math.round(Math.max(0, work));
  };

  const minutesToWork = (minutes: number) => {
    return Math.max(0, minutes);
  };

  const formatWorkDuration = (minutes: number) => {
    const normalizedMinutes = workToMinutes(minutes);
    const hours = Math.floor(normalizedMinutes / 60);
    const remainingMinutes = normalizedMinutes % 60;

    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;

    return `${hours}h${remainingMinutes}m`;
  };

  const calculateTotalProgress = (
    pages: ManuscriptPage[],
    workSteps: WorkProcessStep[] = DEFAULT_WORK_PROCESS.steps
  ) => {
    if (pages.length === 0) return 0;

    const total = pages.reduce((sum, page) => {
      return sum + calculatePageProgress(page, workSteps);
    }, 0);

    return Math.round(total / pages.length);
  };

  const calculateRemainingWork = (
    pages: ManuscriptPage[],
    workSteps: WorkProcessStep[] = DEFAULT_WORK_PROCESS.steps
  ) => {
    const totalWork = pages.length * getTotalStepMinutes(workSteps);
    const currentWork = pages.reduce((sum, page) => {
      return sum + calculateStatusCompletedMinutes(page.status, workSteps);
    }, 0);

    return totalWork - currentWork;
  };

  const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);

    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const diff = deadlineDate.getTime() - today.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const isBeforeStartDate = (startDate: string) => {
    if (!startDate) return false;

    const today = new Date();
    const start = new Date(startDate);

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    return start.getTime() > today.getTime();
  };

  const calculateDailyWork = (
    pages: ManuscriptPage[],
    deadline: string,
    workSteps = DEFAULT_WORK_PROCESS.steps
  ) => {
    const remainingWork = calculateRemainingWork(pages, workSteps);
    const daysLeft = calculateDaysLeft(deadline);

    if (daysLeft === 0) return remainingWork;

    return Math.ceil(remainingWork / daysLeft);
  };

  const calculateCrunchLevel = (
    pages: ManuscriptPage[],
    deadline: string,
    startDate = "",
    workSteps = DEFAULT_WORK_PROCESS.steps
  ): CrunchLevel => {
    const totalProgress = calculateTotalProgress(pages, workSteps);
    const remainingWork = calculateRemainingWork(pages, workSteps);
    const dailyWork = calculateDailyWork(pages, deadline, workSteps);
    const daysLeft = calculateDaysLeft(deadline);

    if (remainingWork <= 0) {
      return {
        label: "脱稿済み",
        tone: "emerald",
        message: "完成しています。あとは入稿まわりを落ち着いて確認しましょう。",
        intensity: 0,
      };
    }

    if (isBeforeStartDate(startDate)) {
      return {
        label: "準備期間",
        tone: "sky",
        message: "作業開始日前です。開始したら必要時間を見ながら進めましょう。",
        intensity: 1,
      };
    }

    if (daysLeft === 0) {
      return {
        label: dailyWork >= 360 ? "限界修羅場" : "締切当日",
        tone: dailyWork >= 360 ? "red" : "orange",
        message: "締切当日です。全力を出して完成させましょう！",
        intensity: dailyWork >= 360 ? 5 : 4,
      };
    }

    if (dailyWork < 60) {
      return {
        label: "平穏",
        tone: "emerald",
        message: `今日の必要時間は${formatWorkDuration(dailyWork)}。進捗${totalProgress}%なら、かなり平和です。今のうちに未来の自分へ貯金しておきましょう。`,
        intensity: 1,
      };
    }

    if (dailyWork < 120) {
      return {
        label: "通常",
        tone: "sky",
        message: `今日の必要時間は${formatWorkDuration(dailyWork)}。進捗${totalProgress}%なら、いつもの原稿ペースです。机に向かえば勝ちです。`,
        intensity: 2,
      };
    }

    if (dailyWork < 180 || (totalProgress >= 30 && daysLeft <= 5)) {
      return {
        label: "修羅場一歩手前",
        tone: "amber",
        message: `今日の必要時間は${formatWorkDuration(dailyWork)}。進捗${totalProgress}%なら、まだ戻れます。原稿を開いて、1ページずつ着実に進めましょう。`,
        intensity: 3,
      };
    }

    if (dailyWork < 360 || (totalProgress >= 50 && daysLeft <= 3)) {
      return {
        label: "修羅場",
        tone: "orange",
        message: `今日の必要時間は${formatWorkDuration(dailyWork)}。かなり熱い戦いです。今いちばん効く作業から片付けましょう。`,
        intensity: 4,
      };
    }

    return {
      label: "限界修羅場",
      tone: "red",
      message: `今日の必要時間は${formatWorkDuration(dailyWork)}。かなり危険域です。それでも出したいんですよね？ まず深呼吸して、削れる作業・残す作業を分けましょう。`,
      intensity: 5,
    };
  };

  return {
    completedStepMap,
    calculatePageProgress,
    calculateStatusCompletedMinutes,
    calculateTotalProgress,
    calculateRemainingWork,
    calculateDaysLeft,
    isBeforeStartDate,
    calculateDailyWork,
    calculateCrunchLevel,
    workToMinutes,
    minutesToWork,
    formatWorkDuration,
  };
};
