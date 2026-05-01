import type { ManuscriptPage, PageStatus } from "~/types/project";

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

  const calculateDailyWork = (
    pages: ManuscriptPage[],
    deadline: string
  ) => {
    const remainingWork = calculateRemainingWork(pages);
    const daysLeft = calculateDaysLeft(deadline);

    if (daysLeft === 0) return remainingWork;

    return Math.ceil(remainingWork / daysLeft);
  };

  return {
    progressMap,
    calculateTotalProgress,
    calculateRemainingWork,
    calculateDaysLeft,
    calculateDailyWork,
  };
};
