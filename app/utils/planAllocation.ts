import type { Project } from "~~/types/project";

export const PLAN_ALLOCATION_UNIT = 15;
// Firestoreルールの日付キー上限（dailyWorkEntries.keys().size() <= 800）に合わせる。
const MAX_DAILY_ENTRY_COUNT = 800;

type AllocatePlannedMinutesInput = {
  totalMinutes: number;
  dateKeys: string[];
  weightOf: (dateKey: string) => number;
  unit?: number;
};

export type AllocationOptions = {
  weekendWeight: number;
  restDays: number[];
};

export type MinutesRange = {
  min: number;
  max: number;
};

export type AllocationPlan = {
  blockReason?: string;
  plannedByDate: Record<string, number>;
  from: string;
  to: string;
  totalMinutes: number;
  workDayCount: number;
  restDayCount: number;
  weekdayRange?: MinutesRange;
  weekendRange?: MinutesRange;
  overwriteCount: number;
};

type BuildAllocationPlanInput = {
  project: Project;
  options: AllocationOptions;
  remainingMinutes: number;
  todayKey: string;
  getActualMinutes: (dateKey: string) => number;
};

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey: string) => {
  const [year = NaN, month = NaN, day = NaN] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
};

export const parseDateKeyFromQuery = (value: unknown) => {
  const dateKey = Array.isArray(value) ? value[0] : value;
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null;
  }

  return parseDateKey(dateKey);
};

export const listDateKeys = (from: string, to: string) => {
  const dateKeys: string[] = [];
  if (!from || !to || from > to) return dateKeys;

  const date = parseDateKey(from);
  let dateKey = from;

  while (dateKey <= to) {
    dateKeys.push(dateKey);
    date.setDate(date.getDate() + 1);
    dateKey = formatDateKey(date);
  }

  return dateKeys;
};

export const allocatePlannedMinutes = ({
  totalMinutes,
  dateKeys,
  weightOf,
  unit = PLAN_ALLOCATION_UNIT,
}: AllocatePlannedMinutesInput): Record<string, number> => {
  const total = Math.max(0, Math.round(totalMinutes));
  const days = dateKeys.map((dateKey, index) => ({
    dateKey,
    index,
    weight: Math.max(0, weightOf(dateKey)),
  }));
  const weightSum = days.reduce((sum, day) => sum + day.weight, 0);
  const result: Record<string, number> = Object.fromEntries(dateKeys.map((dateKey) => [dateKey, 0]));
  if (total === 0 || weightSum === 0) return result;

  // まず単位で切り捨てて配り、余った単位は切り捨て幅が大きい日から順に足す（最大剰余法）。
  const totalUnits = Math.floor(total / unit);
  const allocations = days.map((day) => {
    const share = (totalUnits * day.weight) / weightSum;
    const units = Math.floor(share);

    return { ...day, units, remainder: share - units };
  });
  let leftoverUnits = totalUnits - allocations.reduce((sum, { units }) => sum + units, 0);

  const order = allocations
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (const allocation of order) {
    if (leftoverUnits <= 0) break;
    allocation.units += 1;
    leftoverUnits -= 1;
  }

  allocations.forEach(({ dateKey, units }) => {
    result[dateKey] = units * unit;
  });

  // 単位未満の端数は最初の作業日に寄せ、合計を残り作業時間ちょうどにする。
  const firstWorkDay = days.find(({ weight }) => weight > 0);
  if (firstWorkDay) {
    const { dateKey } = firstWorkDay;
    result[dateKey] = (result[dateKey] ?? 0) + total - totalUnits * unit;
  }

  return result;
};

const isWeekend = (weekday: number) => {
  return weekday === 0 || weekday === 6;
};

const allocationWeight = (options: AllocationOptions, dateKey: string) => {
  const weekday = parseDateKey(dateKey).getDay();
  if (options.restDays.includes(weekday)) return 0;

  return isWeekend(weekday) ? options.weekendWeight : 1;
};

const toMinutesRange = (values: number[]): MinutesRange | undefined => {
  if (values.length === 0) return undefined;

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

export const buildAllocationPlan = ({
  project,
  options,
  remainingMinutes: totalMinutes,
  todayKey,
  getActualMinutes,
}: BuildAllocationPlanInput): AllocationPlan => {
  const dateKeys = listDateKeys(todayKey, project.deadline);
  const workDateKeys = dateKeys.filter((dateKey) => allocationWeight(options, dateKey) > 0);
  const plan: AllocationPlan = {
    plannedByDate: {},
    from: dateKeys[0] ?? todayKey,
    to: project.deadline,
    totalMinutes,
    workDayCount: workDateKeys.length,
    restDayCount: dateKeys.length - workDateKeys.length,
    overwriteCount: Object.entries(project.dailyWorkEntries)
      .filter(([dateKey, entry]) => dateKey >= todayKey && entry.planned > 0)
      .length,
  };

  if (totalMinutes <= 0) return { ...plan, blockReason: "残り作業時間がないため、割り振る予定はありません。" };
  if (dateKeys.length === 0) return { ...plan, blockReason: "締切を過ぎているため、割り振れません。" };
  if (workDateKeys.length === 0) return { ...plan, blockReason: "作業する曜日を1つ以上残してください。" };

  const allocated = allocatePlannedMinutes({
    totalMinutes,
    dateKeys,
    weightOf: (dateKey) => allocationWeight(options, dateKey),
  });
  const weekdayMinutes: number[] = [];
  const weekendMinutes: number[] = [];

  for (const dateKey of workDateKeys) {
    const minutes = allocated[dateKey] ?? 0;
    (isWeekend(parseDateKey(dateKey).getDay()) ? weekendMinutes : weekdayMinutes).push(minutes);
  }

  // 今日の作業済み分は残り作業時間から引かれているため、予定には上乗せして保存する。
  const plannedByDate = Object.fromEntries(
    Object.entries(allocated).map(([dateKey, minutes]) => [
      dateKey,
      dateKey === todayKey ? minutes + getActualMinutes(dateKey) : minutes,
    ])
  );

  const remainingKeys = Object.keys(project.dailyWorkEntries).filter((dateKey) => {
    return dateKey < todayKey || getActualMinutes(dateKey) > 0;
  });
  const resultingKeys = new Set([
    ...remainingKeys,
    ...Object.keys(plannedByDate).filter((dateKey) => (plannedByDate[dateKey] ?? 0) > 0),
  ]);
  if (resultingKeys.size > MAX_DAILY_ENTRY_COUNT) {
    return { ...plan, blockReason: "期間が長すぎるため、自動割り振りできません。" };
  }

  return {
    ...plan,
    plannedByDate,
    weekdayRange: toMinutesRange(weekdayMinutes),
    weekendRange: toMinutesRange(weekendMinutes),
  };
};

export const formatMinutesRange = (
  range: MinutesRange,
  formatMinutes: (minutes: number) => string
) => {
  if (range.min === range.max) return formatMinutes(range.min);

  return `${formatMinutes(range.min)}〜${formatMinutes(range.max)}`;
};

export const formatAllocationRange = (plan: AllocationPlan) => {
  const format = (dateKey: string) => {
    const date = parseDateKey(dateKey);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return `${format(plan.from)}〜${format(plan.to)}`;
};
