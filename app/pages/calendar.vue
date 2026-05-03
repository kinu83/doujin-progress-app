<template>
  <main class="min-h-screen bg-gray-100 px-4 py-6 text-gray-900 sm:px-6">
    <div class="mx-auto max-w-5xl">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="items-center gap-3">
          <NuxtLink to="/" class="text-sm font-semibold text-gray-500">
        ← 一覧に戻る
          </NuxtLink>
          <div>
            <h1 class="mt-2 text-2xl font-bold tracking-normal text-gray-950">
              カレンダー
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              イベント日、原稿締切、作業開始日と日々の作業量をまとめて確認できます。
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-200">
          <button
            type="button"
            aria-label="前の月"
            title="前の月"
            class="grid h-9 w-9 place-items-center rounded-full text-gray-700 transition hover:bg-gray-100"
            @click="moveMonth(-1)"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            class="rounded-full px-4 py-2 text-sm font-bold text-gray-800 transition hover:bg-gray-100"
            @click="goToday"
          >
            今日
          </button>
          <button
            type="button"
            aria-label="次の月"
            title="次の月"
            class="grid h-9 w-9 place-items-center rounded-full text-gray-700 transition hover:bg-gray-100"
            @click="moveMonth(1)"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 class="text-xl font-bold text-gray-950">
              {{ monthTitle }}
            </h2>
            <div class="flex flex-wrap items-center justify-end gap-3">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span class="h-2 w-8 rounded-full bg-gray-900" />
                今日の作業量
              </div>
              <div class="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span class="h-2 w-8 rounded-full border border-gray-400 bg-white" />
                予定
              </div>
              <p class="text-sm font-semibold text-gray-500">
                {{ monthTotals.actual }} / {{ monthTotals.planned }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            <div
              v-for="weekday in weekdays"
              :key="weekday"
              class="px-2 py-2 text-center text-xs font-bold text-gray-500"
            >
              {{ weekday }}
            </div>
          </div>

          <div class="grid grid-cols-7">
            <button
              v-for="day in calendarDays"
              :key="day.dateKey"
              type="button"
              class="flex min-h-28 flex-col items-start justify-start border-b border-r border-gray-100 p-2 text-left transition hover:bg-gray-50 sm:min-h-32"
              :class="[
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400',
                selectedDate === day.dateKey ? 'ring-2 ring-inset ring-gray-900' : '',
              ]"
              @click="selectDate(day.dateKey)"
            >
              <div class="flex w-full items-start justify-between gap-2">
                <span
                  class="grid h-7 w-7 place-items-center rounded-full text-sm font-bold"
                  :class="day.isToday ? 'bg-red-500 text-white' : 'text-gray-800'"
                >
                  {{ day.dayNumber }}
                </span>
                <span
                  v-if="dayTotals(day.dateKey).planned || dayTotals(day.dateKey).actual"
                  class="text-[11px] font-bold text-gray-500"
                >
                  {{ dayTotals(day.dateKey).actual }}/{{ dayTotals(day.dateKey).planned }}
                </span>
              </div>

              <div class="mt-2 grid gap-1">
                <span
                  v-for="item in daySchedule(day.dateKey).slice(0, 3)"
                  :key="`${item.projectId}-${item.kind}`"
                  class="truncate rounded-md px-2 py-1 text-[11px] font-bold"
                  :class="scheduleClasses[item.kind]"
                >
                  {{ scheduleLabels[item.kind] }} {{ item.title }}
                </span>
                <span
                  v-if="daySchedule(day.dateKey).length > 3"
                  class="px-2 text-[11px] font-bold text-gray-400"
                >
                  他 {{ daySchedule(day.dateKey).length - 3 }} 件
                </span>
              </div>

              <div
                v-if="workBars(day.dateKey).length"
                class="mt-auto grid w-full gap-1 pt-2"
                :aria-label="`${day.dateKey} の今日の作業量 ${dayTotals(day.dateKey).actual}、予定 ${dayTotals(day.dateKey).planned}`"
              >
                <span
                  v-for="bar in workBars(day.dateKey)"
                  :key="bar.level"
                  class="h-1.5 w-full rounded-full border"
                  :class="barClass(bar)"
                  :style="barStyle(bar)"
                />
                <span
                  v-if="hasHiddenBars(day.dateKey)"
                  class="text-[10px] font-bold text-gray-400"
                >
                  +{{ hiddenBarCount(day.dateKey) }}
                </span>
              </div>
            </button>
          </div>
        </section>

        <aside class="rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
          <div class="border-b border-gray-200 px-5 py-5">
            <p class="text-sm font-bold text-red-500">
              {{ selectedDateLabel }}
            </p>
            <h2 class="mt-1 text-lg font-bold text-gray-950">
              作業量
            </h2>
          </div>

          <div class="grid gap-5 px-5 py-5">
            <section v-if="selectedSchedule.length" class="grid gap-2">
              <h3 class="text-sm font-bold text-gray-500">
                予定日
              </h3>
              <div class="grid gap-2">
                <NuxtLink
                  v-for="item in selectedSchedule"
                  :key="`${item.projectId}-${item.kind}`"
                  :to="`/projects/${item.projectId}`"
                  class="rounded-2xl px-4 py-3 text-sm font-bold"
                  :class="scheduleClasses[item.kind]"
                >
                  {{ scheduleLabels[item.kind] }} {{ item.title }}
                </NuxtLink>
              </div>
            </section>

            <section class="grid gap-3">
              <h3 class="text-sm font-bold text-gray-500">
                プロジェクト別予定
              </h3>

              <div
                v-if="projects.length === 0"
                class="rounded-2xl border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500"
              >
                プロジェクトを作成すると、日別予定を入力できます。
              </div>

              <div
                v-else-if="editableProjects.length === 0"
                class="rounded-2xl border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500"
              >
                この日は作業期間内のプロジェクトがありません。
              </div>

              <div
                v-for="project in editableProjects"
                :key="project.id"
                class="rounded-2xl border border-gray-200 p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <NuxtLink
                    :to="`/projects/${project.id}`"
                    class="min-w-0 font-bold text-gray-900 hover:underline"
                  >
                    {{ project.title }}
                  </NuxtLink>
                  <span class="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                    {{ project.totalPages }}P
                  </span>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-gray-500">
                  <span class="rounded-xl bg-gray-50 px-3 py-2">
                    進捗 {{ calculateTotalProgress(project.pages) }}%
                  </span>
                  <span class="rounded-xl bg-gray-50 px-3 py-2">
                    残り {{ calculateRemainingWork(project.pages) }}
                  </span>
                </div>

                <p
                  v-if="projectUnplannedWork(project) > 0"
                  class="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                >
                  必要な作業量分の予定量を入力してください。あと {{ projectUnplannedWork(project) }} 割り振れます。
                </p>

                <div class="mt-4 grid grid-cols-2 gap-3">
                  <div class="grid gap-2">
                    <span class="text-xs font-bold text-gray-500">予定</span>
                    <div class="flex overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:border-gray-900">
                      <input
                        :value="dailyEntry(project.id).planned"
                        type="number"
                        min="0"
                        step="any"
                        :max="maxPlannedEntry(project.id)"
                        inputmode="decimal"
                        class="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
                        @input="handlePlannedEntry(project.id, $event)"
                      >
                      <div class="grid w-9 shrink-0 border-l border-gray-200">
                        <button
                          type="button"
                          aria-label="予定を10増やす"
                          title="予定を10増やす"
                          class="grid place-items-center text-gray-700 transition hover:bg-gray-100"
                          @click="adjustPlannedEntry(project.id, 10)"
                        >
                          <svg
                            class="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                          >
                            <path d="m18 15-6-6-6 6" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="予定を10減らす"
                          title="予定を10減らす"
                          class="grid place-items-center border-t border-gray-200 text-gray-700 transition hover:bg-gray-100"
                          @click="adjustPlannedEntry(project.id, -10)"
                        >
                          <svg
                            class="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="grid gap-2">
                    <span class="text-xs font-bold text-gray-500">今日の作業量</span>
                    <div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800">
                      {{ dailyEntry(project.id).actual }}
                    </div>
                  </div>
                </div>

                <NuxtLink
                  :to="`/projects/${project.id}`"
                  class="ml-auto mt-4 flex w-fit items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-700"
                >
                  作業量入力
                </NuxtLink>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { DailyWorkEntry, Project } from "~/types/project";
import { useProjects } from "~/composables/useProjects";
import { useProgress } from "~/composables/useProgress";

type ScheduleKind = "event" | "deadline" | "start";

type ScheduleItem = {
  projectId: string;
  title: string;
  kind: ScheduleKind;
};

const { projects, loadProjects, updateDailyWorkEntry } = useProjects();
const { calculateTotalProgress, calculateRemainingWork } = useProgress();

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const workBarUnit = 20;
const maxCollapsedWorkBars = 4;
const scheduleLabels: Record<ScheduleKind, string> = {
  event: "イベント",
  deadline: "締切",
  start: "開始",
};
const scheduleClasses: Record<ScheduleKind, string> = {
  event: "bg-red-50 text-red-700",
  deadline: "bg-orange-50 text-orange-700",
  start: "bg-blue-50 text-blue-700",
};

const today = new Date();
const selectedDate = ref(formatDateKey(today));
const visibleYear = ref(today.getFullYear());
const visibleMonth = ref(today.getMonth());

onMounted(() => {
  loadProjects();
});

const monthTitle = computed(() => {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
  }).format(new Date(visibleYear.value, visibleMonth.value, 1));
});

const selectedDateLabel = computed(() => {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseDateKey(selectedDate.value));
});

const calendarDays = computed(() => {
  const firstDay = new Date(visibleYear.value, visibleMonth.value, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

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

const monthTotals = computed(() => {
  return calendarDays.value.reduce(
    (sum, day) => {
      if (!day.isCurrentMonth) return sum;

      const totals = dayTotals(day.dateKey);
      sum.planned += totals.planned;
      sum.actual += totals.actual;
      return sum;
    },
    { planned: 0, actual: 0 }
  );
});

const selectedSchedule = computed(() => daySchedule(selectedDate.value));

const editableProjects = computed(() => {
  return projects.value.filter((project) => {
    return isWithinWorkPeriod(project, selectedDate.value) || hasDailyEntry(project, selectedDate.value);
  });
});

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function moveMonth(amount: number) {
  const next = new Date(visibleYear.value, visibleMonth.value + amount, 1);
  visibleYear.value = next.getFullYear();
  visibleMonth.value = next.getMonth();
}

function goToday() {
  const now = new Date();
  selectedDate.value = formatDateKey(now);
  visibleYear.value = now.getFullYear();
  visibleMonth.value = now.getMonth();
}

function selectDate(dateKey: string) {
  selectedDate.value = dateKey;
}

function daySchedule(dateKey: string): ScheduleItem[] {
  return projects.value.flatMap((project) => {
    const items: ScheduleItem[] = [];

    if (project.eventDate === dateKey) {
      items.push(toScheduleItem(project, "event"));
    }

    if (project.deadline === dateKey) {
      items.push(toScheduleItem(project, "deadline"));
    }

    if (project.startDate === dateKey) {
      items.push(toScheduleItem(project, "start"));
    }

    return items;
  });
}

function toScheduleItem(project: Project, kind: ScheduleKind): ScheduleItem {
  return {
    projectId: project.id,
    title: kind === "event" && project.eventName ? project.eventName : project.title,
    kind,
  };
}

function dayTotals(dateKey: string) {
  return projects.value.reduce(
    (sum, project) => {
      const entry = project.dailyWorkEntries[dateKey];
      if (!entry) return sum;
      if (!isWithinWorkPeriod(project, dateKey) && entry.planned === 0 && entry.actual === 0) return sum;

      sum.planned += entry.planned;
      sum.actual += entry.actual;
      return sum;
    },
    { planned: 0, actual: 0 }
  );
}

function workBars(dateKey: string) {
  const totals = dayTotals(dateKey);
  const plannedBars = Math.ceil(totals.planned / workBarUnit);
  const actualBars = Math.ceil(totals.actual / workBarUnit);
  const totalBars = Math.max(plannedBars, actualBars);
  const isCollapsed = !shouldShowAllBars(dateKey) && totalBars > maxCollapsedWorkBars;
  const visibleBars = isCollapsed
    ? maxCollapsedWorkBars
    : totalBars;

  return Array.from({ length: visibleBars }, (_, index) => {
    const level = visibleBars - index - 1;
    const fillRatio = totals.planned > 0
      ? totals.actual / totals.planned
      : Number(totals.actual > 0);
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
}

function hasHiddenBars(dateKey: string) {
  if (shouldShowAllBars(dateKey)) return false;

  const totals = dayTotals(dateKey);
  const totalBars = Math.max(
    Math.ceil(totals.planned / workBarUnit),
    Math.ceil(totals.actual / workBarUnit)
  );

  return totalBars > maxCollapsedWorkBars;
}

function hiddenBarCount(dateKey: string) {
  if (shouldShowAllBars(dateKey)) return 0;

  const totals = dayTotals(dateKey);
  const totalBars = Math.max(
    Math.ceil(totals.planned / workBarUnit),
    Math.ceil(totals.actual / workBarUnit)
  );

  return Math.max(totalBars - maxCollapsedWorkBars, 0);
}

function barClass(bar: {
  isPlanned: boolean;
  isActual: boolean;
  isOverActual: boolean;
  isCompressed: boolean;
}) {
  if (bar.isCompressed) {
    return bar.isOverActual
      ? "border-blue-600 bg-white"
      : "border-gray-400 bg-white";
  }

  if (bar.isOverActual) return "border-blue-600";
  if (bar.isActual) return "border-gray-900";
  if (bar.isPlanned) return "border-gray-400 bg-white";

  return "border-gray-200 bg-white";
}

function barStyle(bar: {
  fillPercent: number;
  plannedFillPercent: number;
  isActual: boolean;
  isOverActual: boolean;
  isCompressed: boolean;
}) {
  if (!bar.isActual) return {};

  if (bar.isCompressed && bar.isOverActual) {
    return {
      background: `linear-gradient(to right, #111827 ${bar.plannedFillPercent}%, #2563eb ${bar.plannedFillPercent}%, #2563eb ${bar.fillPercent}%, #ffffff ${bar.fillPercent}%)`,
    };
  }

  const fillColor = bar.isOverActual ? "#2563eb" : "#111827";

  return {
    background: `linear-gradient(to right, ${fillColor} ${bar.fillPercent}%, #ffffff ${bar.fillPercent}%)`,
  };
}

function shouldShowAllBars(dateKey: string) {
  return getWeekStartKey(dateKey) === getWeekStartKey(selectedDate.value);
}

function getWeekStartKey(dateKey: string) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() - date.getDay());

  return formatDateKey(date);
}

function isWithinWorkPeriod(project: Project, dateKey: string) {
  if (!project.startDate || !project.deadline) return false;

  return project.startDate <= dateKey && dateKey <= project.deadline;
}

function hasDailyEntry(project: Project, dateKey: string) {
  const entry = project.dailyWorkEntries[dateKey];

  return Boolean(entry && (entry.planned > 0 || entry.actual > 0));
}

function dailyEntry(projectId: string): DailyWorkEntry {
  const project = projects.value.find((item) => item.id === projectId);

  return project?.dailyWorkEntries[selectedDate.value] ?? {
    planned: 0,
    actual: 0,
  };
}

function projectRequiredWork(project: Project) {
  return calculateRemainingWork(project.pages);
}

function projectPlannedTotal(project: Project) {
  return Object.values(project.dailyWorkEntries).reduce((sum, entry) => {
    return sum + entry.planned;
  }, 0);
}

function projectUnplannedWork(project: Project) {
  return Math.max(projectRequiredWork(project) - projectPlannedTotal(project), 0);
}

function maxPlannedEntry(projectId: string) {
  const project = projects.value.find((item) => item.id === projectId);
  if (!project) return 0;

  const current = dailyEntry(projectId);
  return Math.max(current.planned + projectUnplannedWork(project), 0);
}

function normalizePlannedEntry(projectId: string, value: number) {
  return Math.max(0, Math.min(Number.isFinite(value) ? value : 0, maxPlannedEntry(projectId)));
}

function handlePlannedEntry(projectId: string, event: Event) {
  const current = dailyEntry(projectId);
  const input = event.target as HTMLInputElement;
  const planned = normalizePlannedEntry(projectId, Number(input.value));
  input.value = String(planned);

  updateDailyWorkEntry(projectId, selectedDate.value, {
    ...current,
    planned,
  });
}

function adjustPlannedEntry(projectId: string, amount: number) {
  const current = dailyEntry(projectId);
  const planned = normalizePlannedEntry(projectId, current.planned + amount);

  updateDailyWorkEntry(projectId, selectedDate.value, {
    ...current,
    planned,
  });
}
</script>
