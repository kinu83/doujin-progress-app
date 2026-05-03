type EventDisplayInput = {
  eventDate: string;
  eventName: string;
};

export const formatEventLabel = (project: EventDisplayInput) => {
  const formattedDate = formatProjectDate(project.eventDate);

  return [formattedDate, project.eventName.trim()].filter(Boolean).join(" ");
};

export const formatProjectDate = (date: string) => {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return "";

  return `${Number(year)}.${Number(month)}.${Number(day)}`;
};
