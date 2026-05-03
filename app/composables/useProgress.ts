import type { ManuscriptPage, PageStatus } from "~/types/project";
import { DEFAULT_SETTINGS, useSettings } from "~/composables/useSettings";

export type CrunchLevelTone = "emerald" | "sky" | "amber" | "orange" | "red";

export type CrunchLevel = {
  label: string;
  tone: CrunchLevelTone;
  message: string;
  intensity: number;
};

export const completedStepMap: Record<PageStatus, number> = {
  未着手: 0,
  ネーム: 1,
  下描き: 2,
  ペン入れ: 3,
  仕上げ: 4,
  完成: 5,
};

export const totalStepCount = 5;
export const defaultStepMinutes = DEFAULT_SETTINGS.defaultStepMinutes;

export const calculatePageProgress = (page: ManuscriptPage) => {
  return Math.round((completedStepMap[page.status] / totalStepCount) * 100);
};

export const calculateStatusCompletedMinutes = (
  status: PageStatus,
  stepMinutes = defaultStepMinutes
) => {
  return completedStepMap[status] * stepMinutes;
};

export const useProgress = () => {
  const { settings, loadSettings } = useSettings();
  loadSettings();

  const stepMinutes = computed(() => settings.value.defaultStepMinutes);

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

  const calculateTotalProgress = (pages: ManuscriptPage[]) => {
    if (pages.length === 0) return 0;

    const total = pages.reduce((sum, page) => {
      return sum + calculatePageProgress(page);
    }, 0);

    return Math.round(total / pages.length);
  };

  const calculateRemainingWork = (pages: ManuscriptPage[]) => {
    const totalWork = pages.length * totalStepCount * stepMinutes.value;
    const currentWork = pages.reduce((sum, page) => {
      return sum + calculateStatusCompletedMinutes(page.status, stepMinutes.value);
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
    deadline: string
  ) => {
    const remainingWork = calculateRemainingWork(pages);
    const daysLeft = calculateDaysLeft(deadline);

    if (daysLeft === 0) return remainingWork;

    return Math.ceil(remainingWork / daysLeft);
  };

  const calculateCrunchLevel = (
    pages: ManuscriptPage[],
    deadline: string,
    startDate = ""
  ): CrunchLevel => {
    const totalProgress = calculateTotalProgress(pages);
    const remainingWork = calculateRemainingWork(pages);
    const dailyWork = calculateDailyWork(pages, deadline);
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
        message: "締切当日です。全力を出して、全てを片付けましょう！",
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

    if (dailyWork < 180) {
      return {
        label: "修羅場一歩手前",
        tone: "amber",
        message: `今日の必要時間は${formatWorkDuration(dailyWork)}。進捗${totalProgress}%なら、まだ戻れます。原稿を開いて、1ページずつ着実に進めましょう。`,
        intensity: 3,
      };
    }

    if (dailyWork < 360) {
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
