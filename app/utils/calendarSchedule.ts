import type { Project } from "~~/types/project";
import type { WorkTotals } from "~/utils/workBars";

export type ScheduleKind = "event" | "deadline" | "start";

export type ScheduleItem = {
  projectId: string;
  title: string;
  kind: ScheduleKind;
};

export type DateMode = "past" | "today" | "future";

export type DayProjectTotals = WorkTotals & {
  project: Project;
};

export const scheduleLabels: Record<ScheduleKind, string> = {
  event: "イベント",
  deadline: "締切",
  start: "開始",
};

export const scheduleClasses: Record<ScheduleKind, string> = {
  event: "border-red-500 bg-red-50 text-red-700",
  deadline: "border-[#ff4b1f] bg-[#fff2e3] text-[#f36b00]",
  start: "border-[#2c8d98] bg-[#edf6fa] text-[#2c8d98]",
};

const toScheduleItem = (project: Project, kind: ScheduleKind): ScheduleItem => {
  return {
    projectId: project.id,
    // イベント日は作品タイトルよりイベント名を優先して、カレンダー上の意味を分かりやすくする。
    title: kind === "event" && project.eventName ? project.eventName : project.title,
    kind,
  };
};

export const daySchedule = (projects: Project[], dateKey: string): ScheduleItem[] => {
  return projects.flatMap((project) => {
    const items: ScheduleItem[] = [];

    // 1つのプロジェクトが同じ日に複数の節目を持つ場合は、それぞれ別ラベルで出す。
    if (project.eventDate === dateKey) {
      items.push(toScheduleItem(project, "event"));
    }

    if (project.deadline === dateKey) {
      items.push(toScheduleItem(project, "deadline"));
    }

    if (project.startDate === dateKey) {
      items.push(toScheduleItem(project, "start"));
    }

    return items;
  });
};

export const dayProjectTotals = (
  projects: Project[],
  dateKey: string,
  getActualMinutes: (projectId: string, dateKey: string) => number
): DayProjectTotals[] => {
  return projects.flatMap((project) => {
    const planned = project.dailyWorkEntries[dateKey]?.planned ?? 0;
    const actual = getActualMinutes(project.id, dateKey);
    // 予定も実績もない日は、作業期間内でも合計やドットに含めない。
    if (planned === 0 && actual === 0) return [];

    return [{ project, planned, actual }];
  });
};

export const sumWorkTotals = (totalsList: WorkTotals[]): WorkTotals => {
  return totalsList.reduce(
    (sum, totals) => ({
      planned: sum.planned + totals.planned,
      actual: sum.actual + totals.actual,
    }),
    { planned: 0, actual: 0 }
  );
};

export const isWithinWorkPeriod = (project: Project, dateKey: string) => {
  if (!project.startDate || !project.deadline) return false;

  return project.startDate <= dateKey && dateKey <= project.deadline;
};

export const dateModeOf = (dateKey: string, todayKey: string): DateMode => {
  if (dateKey < todayKey) return "past";
  if (dateKey === todayKey) return "today";

  return "future";
};

const hasDailyEntry = (
  project: Project,
  dateKey: string,
  getActualMinutes: (projectId: string, dateKey: string) => number
) => {
  const entry = project.dailyWorkEntries[dateKey];
  const actual = getActualMinutes(project.id, dateKey);

  return Boolean((entry && entry.planned > 0) || actual > 0);
};

export const editableProjectsOn = (
  projects: Project[],
  dateKey: string,
  getActualMinutes: (projectId: string, dateKey: string) => number
) => {
  return projects.filter((project) => {
    // 作業期間外でも、すでに予定や実績がある日は編集できるように残す。
    return isWithinWorkPeriod(project, dateKey) || hasDailyEntry(project, dateKey, getActualMinutes);
  });
};
