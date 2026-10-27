export type WorkTotals = {
  planned: number;
  actual: number;
};

export type WorkBar = {
  level: number;
  fillPercent: number;
  plannedFillPercent: number;
  isCompressed: boolean;
  isPlanned: boolean;
  isActual: boolean;
  isOverActual: boolean;
};

// バー1本あたりの作業時間（分）。
export const WORK_BAR_UNIT = 60;
// カレンダーの日セルに出すバーの最大本数。超える日は圧縮して、行の高さをそろえる。
export const MAX_DAY_CELL_WORK_BARS = 4;

export const countWorkBars = (totals: WorkTotals) => {
  return Math.max(
    Math.ceil(totals.planned / WORK_BAR_UNIT),
    Math.ceil(totals.actual / WORK_BAR_UNIT)
  );
};

export const createWorkBars = (totals: WorkTotals, maxBars: number): WorkBar[] => {
  const plannedBars = Math.ceil(totals.planned / WORK_BAR_UNIT);
  const actualBars = Math.ceil(totals.actual / WORK_BAR_UNIT);
  const totalBars = Math.max(plannedBars, actualBars);
  const isCollapsed = totalBars > maxBars;
  const visibleBars = isCollapsed
    ? maxBars
    : totalBars;

  return Array.from({ length: visibleBars }, (_, index) => {
    const level = visibleBars - index - 1;
    const fillRatio = totals.planned > 0
      ? totals.actual / totals.planned
      : Number(totals.actual > 0);
    // 圧縮時は予定と実績の比率を同じ本数の中へ写像して、超過分だけ色を分ける。
    const plannedRatioOfActual = totals.actual > 0
      ? totals.planned / totals.actual
      : 0;
    const plannedUnits = plannedRatioOfActual * visibleBars;
    const roundedPlannedUnits = Math.abs(plannedUnits - Math.round(plannedUnits)) < 0.00001
      ? Math.round(plannedUnits)
      : Math.floor(plannedUnits);
    const fillPercent = isCollapsed
      ? Math.max(0, Math.min((fillRatio * visibleBars - level) * 100, 100))
      : Number(level < actualBars) * 100;
    const plannedFillPercent = isCollapsed && totals.actual > totals.planned
      ? Math.max(0, Math.min((roundedPlannedUnits - level) * 100, 100))
      : fillPercent;

    return {
      level,
      fillPercent,
      plannedFillPercent,
      isCompressed: isCollapsed,
      isPlanned: isCollapsed || level < plannedBars,
      isActual: fillPercent > 0,
      isOverActual: totals.actual > totals.planned && fillPercent > 0 && (isCollapsed || level >= plannedBars),
    };
  });
};

export const getWorkBarClass = (bar: WorkBar) => {
  if (bar.isCompressed) {
    // 予定内の青い部分を含むバーは枠線を青のままにし、超過分だけのバーを赤枠にする。
    return bar.isOverActual && bar.plannedFillPercent <= 0
      ? "border-[#f36b00] bg-white"
      : "border-[#2c8d98]/50 bg-white";
  }

  if (bar.isOverActual) return "border-[#f36b00]";
  if (bar.isActual) return "border-[#2c8d98]";
  if (bar.isPlanned) return "border-[#2c8d98]/50 bg-white";

  return "border-[#2c8d98]/20 bg-white";
};

export const getWorkBarStyle = (bar: WorkBar) => {
  if (!bar.isActual) return {};

  if (bar.isCompressed && bar.isOverActual) {
    return {
      background: `linear-gradient(to right, #2c8d98 ${bar.plannedFillPercent}%, #f36b00 ${bar.plannedFillPercent}%, #f36b00 ${bar.fillPercent}%, #ffffff ${bar.fillPercent}%)`,
    };
  }

  const fillColor = bar.isOverActual ? "#f36b00" : "#2c8d98";

  return {
    background: `linear-gradient(to right, ${fillColor} ${bar.fillPercent}%, #ffffff ${bar.fillPercent}%)`,
  };
};
