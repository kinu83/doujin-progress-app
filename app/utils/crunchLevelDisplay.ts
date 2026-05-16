import type { CrunchLevelTone } from "~/composables/useProgress";

const crunchLevelClasses: Record<CrunchLevelTone, string> = {
  emerald: "border-emerald-500 bg-emerald-50 text-emerald-700",
  sky: "border-[#2c8d98] bg-[#edf6fa] text-[#2c8d98]",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  orange: "border-[#ff8a00] bg-orange-50 text-[#f36b00]",
  red: "border-red-500 bg-red-50 text-red-700",
};

export const getCrunchLevelClasses = (tone: string) => {
  // 保存済みデータに未知のtoneが混ざっても、標準色で表示を継続する。
  return crunchLevelClasses[tone as CrunchLevelTone] ?? crunchLevelClasses.sky;
};
