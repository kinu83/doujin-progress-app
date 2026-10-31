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
  const [year = NaN, month = NaN, day = NaN] = dateKey.split("-").map(Number);

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
