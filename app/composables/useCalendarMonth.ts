import { formatDateKey } from "~/utils/planAllocation";

export type CalendarDay = {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

// カレンダーに表示中の年月と、その月の42日分のセルを管理する。
export const useCalendarMonth = (initialDate: Date) => {
  const today = new Date();
  const visibleYear = ref(initialDate.getFullYear());
  const visibleMonth = ref(initialDate.getMonth());

  const monthTitle = computed(() => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
    }).format(new Date(visibleYear.value, visibleMonth.value, 1));
  });

  const calendarDays = computed<CalendarDay[]>(() => {
    const firstDay = new Date(visibleYear.value, visibleMonth.value, 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());

    // 6週間分を固定で描画して、月送り時にカレンダーの高さが跳ねないようにする。
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateKey = formatDateKey(date);

      return {
        dateKey,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === visibleMonth.value,
        isToday: dateKey === formatDateKey(today),
      };
    });
  });

  const moveMonth = (amount: number) => {
    const next = new Date(visibleYear.value, visibleMonth.value + amount, 1);
    visibleYear.value = next.getFullYear();
    visibleMonth.value = next.getMonth();
  };

  const showMonthOf = (date: Date) => {
    visibleYear.value = date.getFullYear();
    visibleMonth.value = date.getMonth();
  };

  return {
    monthTitle,
    calendarDays,
    moveMonth,
    showMonthOf,
  };
};
