import type { ManuscriptPage, PageStatus } from "~/types/project";

export type CrunchLevelTone = "emerald" | "sky" | "amber" | "orange" | "red";

export type CrunchLevel = {
  label: string;
  tone: CrunchLevelTone;
  message: string;
  intensity: number;
};

export const progressMap: Record<PageStatus, number> = {
  未着手: 0,
  ネーム: 20,
  下描き: 40,
  ペン入れ: 60,
  仕上げ: 80,
  完成: 100,
};

export const useProgress = () => {
  const calculateTotalProgress = (pages: ManuscriptPage[]) => {
    if (pages.length === 0) return 0;

    const total = pages.reduce((sum, page) => {
      return sum + page.progress;
    }, 0);

    return Math.round(total / pages.length);
  };

  const calculateRemainingWork = (pages: ManuscriptPage[]) => {
    const totalWork = pages.length * 100;
    const currentWork = pages.reduce((sum, page) => {
      return sum + page.progress;
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
        message: "作業開始日前です。開始したら必要量を見ながら進めましょう。",
        intensity: 1,
      };
    }

    if (daysLeft === 0) {
      return {
        label: dailyWork > 300 ? "限界修羅場" : "締切当日",
        tone: dailyWork > 300 ? "red" : "orange",
        message: "締切当日です。残り作業を今日すべて片付ける計算です。",
        intensity: dailyWork > 300 ? 5 : 4,
      };
    }

    if (dailyWork <= 50) {
      return {
        label: "平穏",
        tone: "emerald",
        message: `今日の必要量は${dailyWork}。進捗${totalProgress}%なら、かなり落ち着いて進められます。`,
        intensity: 1,
      };
    }

    if (dailyWork <= 100) {
      return {
        label: "通常進行",
        tone: "sky",
        message: `今日の必要量は${dailyWork}。1日1ページ未満のペースです。`,
        intensity: 2,
      };
    }

    if (dailyWork <= 200) {
      return {
        label: "修羅場",
        tone: "amber",
        message: `今日の必要量は${dailyWork}。1日1ページ以上の作業量です。`,
        intensity: 3,
      };
    }

    if (dailyWork <= 300) {
      return {
        label: "大修羅場",
        tone: "orange",
        message: `今日の必要量は${dailyWork}。優先順位を絞って進めたい負荷です。`,
        intensity: 4,
      };
    }

    return {
      label: "限界修羅場",
      tone: "red",
      message: `今日の必要量は${dailyWork}。締切やページ数の見直しも考えたい負荷です。`,
      intensity: 5,
    };
  };

  return {
    progressMap,
    calculateTotalProgress,
    calculateRemainingWork,
    calculateDaysLeft,
    isBeforeStartDate,
    calculateDailyWork,
    calculateCrunchLevel,
  };
};
