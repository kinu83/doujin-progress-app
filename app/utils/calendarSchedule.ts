export type ScheduleKind = "event" | "deadline" | "start";

export type ScheduleItem = {
  projectId: string;
  title: string;
  kind: ScheduleKind;
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
