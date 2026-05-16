type EventDisplayInput = {
  eventDate: string;
  eventName: string;
};

export const formatEventLabel = (project: EventDisplayInput) => {
  const formattedDate = formatProjectDate(project.eventDate);

  // 日付かイベント名の片方だけでも、余分な空白を出さずにバッジ表示できるようにする。
  return [formattedDate, project.eventName.trim()].filter(Boolean).join(" ");
};

export const formatProjectDate = (date: string) => {
  const [year, month, day] = date.split("-");
  // 未設定や壊れた日付は、画面側で空文字として扱う。
  if (!year || !month || !day) return "";

  return `${Number(year)}.${Number(month)}.${Number(day)}`;
};
