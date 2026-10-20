export const PLAN_ALLOCATION_UNIT = 15;

type AllocatePlannedMinutesInput = {
  totalMinutes: number;
  dateKeys: string[];
  weightOf: (dateKey: string) => number;
  unit?: number;
};

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
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

export const calculateDailyGuide = (
  remainingMinutes: number,
  dayCount: number,
  unit = PLAN_ALLOCATION_UNIT
) => {
  if (remainingMinutes <= 0 || dayCount <= 0) return 0;

  // 目安は少し多めに見積もれるよう、割り振り単位で切り上げる。
  return Math.ceil(remainingMinutes / dayCount / unit) * unit;
};

export const allocatePlannedMinutes = ({
  totalMinutes,
  dateKeys,
  weightOf,
  unit = PLAN_ALLOCATION_UNIT,
}: AllocatePlannedMinutesInput): Record<string, number> => {
  const total = Math.max(0, Math.round(totalMinutes));
  const weights = dateKeys.map((dateKey) => Math.max(0, weightOf(dateKey)));
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const result: Record<string, number> = Object.fromEntries(dateKeys.map((dateKey) => [dateKey, 0]));
  if (total === 0 || weightSum === 0) return result;

  // まず単位で切り捨てて配り、余った単位は切り捨て幅が大きい日から順に足す（最大剰余法）。
  const totalUnits = Math.floor(total / unit);
  const shares = weights.map((weight) => (totalUnits * weight) / weightSum);
  const units = shares.map(Math.floor);
  let leftoverUnits = totalUnits - units.reduce((sum, value) => sum + value, 0);

  const order = shares
    .map((share, index) => ({ index, remainder: share - units[index] }))
    .filter(({ index }) => weights[index] > 0)
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (const { index } of order) {
    if (leftoverUnits <= 0) break;
    units[index] += 1;
    leftoverUnits -= 1;
  }

  dateKeys.forEach((dateKey, index) => {
    result[dateKey] = units[index] * unit;
  });

  // 単位未満の端数は最初の作業日に寄せ、合計を残り作業時間ちょうどにする。
  const firstWorkDay = dateKeys.find((_, index) => weights[index] > 0);
  if (firstWorkDay) {
    result[firstWorkDay] += total - totalUnits * unit;
  }

  return result;
};
