// バーの青（実績）・オレンジ（予定超過）と見分けやすい色だけを使う。
const projectColorPalette = [
  "#e4577a",
  "#7b61d1",
  "#3a86d4",
  "#2fa36b",
  "#d9a400",
  "#8a5a3c",
  "#c23fb0",
  "#5f6b70",
];

export const fallbackProjectColor = "#5f6b70";

// 色はFirestoreに保存せず、作成順の並びから決める。
export const getProjectColor = (index: number) => {
  return projectColorPalette[index % projectColorPalette.length] ?? fallbackProjectColor;
};
