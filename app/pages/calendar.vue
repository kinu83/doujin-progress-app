<template>
  <main class="min-h-screen bg-[#edf6fa] px-4 py-6 text-[#263236] sm:px-6">
    <div class="mx-auto max-w-7xl">
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <div class="items-center gap-3">
          <NuxtLink
            to="/"
            class="inline-flex items-center rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)]"
          >
            ← 一覧に戻る
          </NuxtLink>
        </div>
      </div>

      <div>
        <section class="overflow-hidden rounded-3xl border-4 border-[#2c8d98] bg-white shadow-[5px_5px_0_rgba(44,141,152,0.16)]">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dashed border-[#2c8d98] px-5 py-4">
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center overflow-hidden rounded-xl border-2 border-[#263236] bg-white shadow-[3px_3px_0_rgba(38,50,54,0.14)]">
                <button
                  type="button"
                  aria-label="前の月"
                  title="前の月"
                  class="grid h-10 w-10 place-items-center text-[#263236] transition hover:bg-[#edf6fa]"
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
                <h2 class="min-w-36 border-x-2 border-[#263236]/20 px-4 text-center text-xl font-black text-[#263236]">
                  {{ monthTitle }}
                </h2>
                <button
                  type="button"
                  aria-label="次の月"
                  title="次の月"
                  class="grid h-10 w-10 place-items-center text-[#263236] transition hover:bg-[#edf6fa]"
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
              <button
                type="button"
                class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.14)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                @click="goToday"
              >
                今日
              </button>
            </div>
            <div class="flex flex-wrap items-center justify-end gap-3">
              <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
                <span class="h-2 w-8 rounded-full bg-[#2c8d98]" />
                作業時間
              </div>
              <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
                <span class="h-2 w-8 rounded-full border-2 border-[#2c8d98]/50 bg-white" />
                予定
              </div>
              <p class="text-sm font-black text-[#263236]/60">
                {{ formatWorkDuration(monthTotals.actual) }} / {{ formatWorkDuration(monthTotals.planned) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-7 border-b-2 border-[#2c8d98] bg-[#edf6fa]">
            <div
              v-for="weekday in weekdays"
              :key="weekday"
              class="px-2 py-2 text-center text-xs font-black text-[#263236]/60"
            >
              {{ weekday }}
            </div>
          </div>

          <div class="grid grid-cols-7">
            <button
              v-for="day in calendarDays"
              :key="day.dateKey"
              type="button"
              class="flex min-h-28 flex-col items-start justify-start border-b border-r border-[#2c8d98]/20 p-2 text-left transition hover:bg-[#f7fcfd] sm:min-h-32"
              :class="[
                day.isCurrentMonth ? 'bg-white' : 'bg-[#edf6fa]/60 text-[#263236]/40',
                selectedDate === day.dateKey ? 'ring-2 ring-inset ring-[#2c8d98]' : '',
              ]"
              @click="selectDate(day.dateKey)"
            >
              <div class="flex w-full items-start justify-between gap-2">
                <span
                  class="grid h-7 w-7 place-items-center rounded-full text-sm font-black"
                  :class="day.isToday ? 'bg-[#ff4b1f] text-white shadow-[2px_2px_0_rgba(255,75,31,0.24)]' : 'text-[#263236]'"
                >
                  {{ day.dayNumber }}
                </span>
                <span
                  v-if="dayTotals(day.dateKey).planned || dayTotals(day.dateKey).actual"
                  class="text-[11px] font-black text-[#263236]/60"
                >
                  {{ formatWorkDuration(dayTotals(day.dateKey).actual) }}/{{ formatWorkDuration(dayTotals(day.dateKey).planned) }}
                </span>
              </div>

              <div class="mt-2 grid gap-1">
                <span
                  v-for="item in daySchedule(day.dateKey).slice(0, 3)"
                  :key="`${item.projectId}-${item.kind}`"
                  class="truncate rounded-md border px-2 py-1 text-[11px] font-black"
                  :class="scheduleClasses[item.kind]"
                >
                  {{ scheduleLabels[item.kind] }} {{ item.title }}
                </span>
                <span
                  v-if="daySchedule(day.dateKey).length > 3"
                  class="px-2 text-[11px] font-black text-[#263236]/40"
                >
                  他 {{ daySchedule(day.dateKey).length - 3 }} 件
                </span>
              </div>

              <div
                v-if="workBars(day.dateKey).length"
                class="mt-auto grid w-full gap-1 pt-2"
                :aria-label="`${day.dateKey} の作業時間 ${formatWorkDuration(dayTotals(day.dateKey).actual)}、予定 ${formatWorkDuration(dayTotals(day.dateKey).planned)}`"
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
                  class="text-[10px] font-black text-[#263236]/40"
                >
                  +{{ hiddenBarCount(day.dateKey) }}
                </span>
              </div>
            </button>
          </div>
        </section>

        <div
          v-if="isWorkPanelOpen"
          class="fixed inset-0 z-40 bg-[#263236]/20 backdrop-blur-[1px]"
          @click.self="closeWorkPanel"
        >
          <aside
            class="ml-auto flex h-full min-h-0 w-full max-w-[420px] flex-col border-l-4 border-[#2c8d98] bg-white shadow-[-8px_0_0_rgba(44,141,152,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-panel-title"
          >
            <div class="flex items-start justify-between gap-4 border-b-2 border-dashed border-[#2c8d98] px-5 py-5">
              <div>
                <p class="text-sm font-black text-[#f36b00]">
                  {{ selectedDateLabel }}
                </p>
                <h2 id="work-panel-title" class="mt-1 text-lg font-black text-[#263236]">
                  作業時間
                </h2>
              </div>
              <button
                type="button"
                aria-label="作業時間入力を閉じる"
                title="閉じる"
                class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.14)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                @click="closeWorkPanel"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div class="grid min-h-0 flex-1 auto-rows-max content-start gap-5 overflow-y-auto px-5 py-5">
              <section v-if="selectedSchedule.length" class="grid gap-2">
                <h3 class="text-sm font-black text-[#263236]/60">
                  予定日
                </h3>
                <div class="grid gap-2">
                  <NuxtLink
                    v-for="item in selectedSchedule"
                    :key="`${item.projectId}-${item.kind}`"
                    :to="`/projects/${item.projectId}`"
                    class="rounded-2xl border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_rgba(38,50,54,0.12)]"
                    :class="scheduleClasses[item.kind]"
                  >
                    {{ scheduleLabels[item.kind] }} {{ item.title }}
                  </NuxtLink>
                </div>
              </section>

              <section class="grid auto-rows-max content-start gap-3">
                <h3 class="text-sm font-black text-[#263236]/60">
                  プロジェクト別予定
                </h3>

                <div
                  v-if="projects.length === 0"
                  class="rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-5 text-center text-sm font-bold text-[#263236]/60"
                >
                  プロジェクトを作成すると、日別予定を入力できます。
                </div>

                <div
                  v-else-if="editableProjects.length === 0"
                  class="rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-5 text-center text-sm font-bold text-[#263236]/60"
                >
                  この日は作業期間内のプロジェクトがありません。
                </div>

                <div
                  v-for="project in editableProjects"
                  :key="project.id"
                  class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]"
                >
                  <div class="flex items-start justify-between gap-3">
                    <NuxtLink
                      :to="`/projects/${project.id}`"
                      class="min-w-0 font-black text-[#263236] hover:text-[#2c8d98]"
                    >
                      {{ project.title }}
                    </NuxtLink>
                    <span class="shrink-0 rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-2 py-1 text-xs font-black text-[#2c8d98]">
                      {{ project.totalPages }}P
                    </span>
                  </div>

                  <div class="mt-3 grid grid-cols-2 gap-2 text-xs font-black text-[#263236]/70">
                    <span class="rounded-xl border-2 border-[#2c8d98]/40 bg-[#edf6fa] px-3 py-2">
                      進捗 {{ calculateTotalProgress(project.pages, project.workProcessSteps) }}%
                    </span>
                    <span class="rounded-xl border-2 border-[#2c8d98]/40 bg-[#edf6fa] px-3 py-2">
                      残り {{ formatWorkDuration(calculateRemainingWork(project.pages, project.workProcessSteps)) }}
                    </span>
                  </div>

                  <p
                    v-if="projectUnplannedWork(project) > 0"
                    class="mt-3 rounded-xl border-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700"
                  >
                    必要な作業時間分の予定を入力してください。あと {{ formatWorkDuration(projectUnplannedWork(project)) }} 割り振れます。
                  </p>

                  <div class="mt-4 grid grid-cols-2 gap-3">
                    <div class="grid gap-2">
                      <span class="text-xs font-black text-[#263236]/60">予定（分）</span>
                      <div class="flex overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                        <input
                          :value="workToMinutes(dailyEntry(project.id).planned)"
                          type="number"
                          min="0"
                          step="any"
                          :max="workToMinutes(maxPlannedEntry(project.id))"
                          inputmode="decimal"
                          class="min-w-0 flex-1 px-3 py-2 text-sm font-bold text-[#263236] outline-none"
                          @input="handlePlannedEntry(project.id, $event)"
                        >
                        <div class="grid w-9 shrink-0 border-l-2 border-[#2c8d98]/30">
                          <button
                            type="button"
                            aria-label="予定を30分増やす"
                            title="予定を30分増やす"
                            class="grid place-items-center text-[#263236] transition hover:bg-[#edf6fa]"
                            @click="adjustPlannedEntry(project.id, 30)"
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
                            aria-label="予定を30分減らす"
                            title="予定を30分減らす"
                            class="grid place-items-center border-t-2 border-[#2c8d98]/30 text-[#263236] transition hover:bg-[#edf6fa]"
                            @click="adjustPlannedEntry(project.id, -30)"
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
                      <span class="text-xs font-black text-[#263236]/60">作業時間</span>
                      <div class="rounded-xl border-2 border-[#2c8d98]/40 bg-[#edf6fa] px-3 py-2 text-sm font-black text-[#263236]">
                        {{ formatWorkDuration(dailyActual(project.id)) }}
                      </div>
                    </div>
                  </div>

                  <NuxtLink
                    :to="{ path: `/projects/${project.id}`, query: { workDate: selectedDate } }"
                    class="ml-auto mt-4 flex w-fit items-center justify-center rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984]"
                  >
                    作業時間入力
                  </NuxtLink>
                </div>
              </section>
            </div>
          </aside>
        </div>
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

const {
  projects,
  loadProjects,
  updateDailyWorkEntry,
  getProjectDailyActualMinutes,
} = useProjects();
const {
  calculateTotalProgress,
  calculateRemainingWork,
  workToMinutes,
  minutesToWork,
  formatWorkDuration,
} = useProgress();

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const workBarUnit = 60;
const maxCollapsedWorkBars = 4;
const scheduleLabels: Record<ScheduleKind, string> = {
  event: "イベント",
  deadline: "締切",
  start: "開始",
};
const scheduleClasses: Record<ScheduleKind, string> = {
  event: "border-red-500 bg-red-50 text-red-700",
  deadline: "border-[#ff4b1f] bg-[#fff2e3] text-[#f36b00]",
  start: "border-[#2c8d98] bg-[#edf6fa] text-[#2c8d98]",
};

const route = useRoute();
const today = new Date();
const initialDate = parseDateKeyFromQuery(route.query.date) ?? today;
const selectedDate = ref(formatDateKey(initialDate));
const visibleYear = ref(initialDate.getFullYear());
const visibleMonth = ref(initialDate.getMonth());
const isWorkPanelOpen = ref(Boolean(route.query.date));

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
    // 作業期間外でも、すでに予定や実績がある日は編集できるように残す。
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

function parseDateKeyFromQuery(value: unknown) {
  const dateKey = Array.isArray(value) ? value[0] : value;
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null;
  }

  return parseDateKey(dateKey);
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
  isWorkPanelOpen.value = true;
}

function selectDate(dateKey: string) {
  selectedDate.value = dateKey;
  isWorkPanelOpen.value = true;
}

function closeWorkPanel() {
  isWorkPanelOpen.value = false;
}

function daySchedule(dateKey: string): ScheduleItem[] {
  return projects.value.flatMap((project) => {
    const items: ScheduleItem[] = [];

    // 1つのプロジェクトが同じ日に複数の節目を持つ場合は、それぞれ別ラベルで出す。
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
    // イベント日は作品タイトルよりイベント名を優先して、カレンダー上の意味を分かりやすくする。
    title: kind === "event" && project.eventName ? project.eventName : project.title,
    kind,
  };
}

function dayTotals(dateKey: string) {
  return projects.value.reduce(
    (sum, project) => {
      const entry = project.dailyWorkEntries[dateKey];
      const actual = getProjectDailyActualMinutes(project.id, dateKey);
      // 作業期間外の空データは月合計にも日別バーにも含めない。
      if (!entry && actual === 0) return sum;
      if (!isWithinWorkPeriod(project, dateKey) && (entry?.planned ?? 0) === 0 && actual === 0) return sum;

      sum.planned += entry?.planned ?? 0;
      sum.actual += actual;
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
  // 選択中の週以外は最大本数へ圧縮し、月表示の密度を保つ。
  const isCollapsed = !shouldShowAllBars(dateKey) && totalBars > maxCollapsedWorkBars;
  const visibleBars = isCollapsed
    ? maxCollapsedWorkBars
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
      ? "border-[#f36b00] bg-white"
      : "border-[#2c8d98]/50 bg-white";
  }

  if (bar.isOverActual) return "border-[#f36b00]";
  if (bar.isActual) return "border-[#2c8d98]";
  if (bar.isPlanned) return "border-[#2c8d98]/50 bg-white";

  return "border-[#2c8d98]/20 bg-white";
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
      background: `linear-gradient(to right, #2c8d98 ${bar.plannedFillPercent}%, #f36b00 ${bar.plannedFillPercent}%, #f36b00 ${bar.fillPercent}%, #ffffff ${bar.fillPercent}%)`,
    };
  }

  const fillColor = bar.isOverActual ? "#f36b00" : "#2c8d98";

  return {
    background: `linear-gradient(to right, ${fillColor} ${bar.fillPercent}%, #ffffff ${bar.fillPercent}%)`,
  };
}

function shouldShowAllBars(dateKey: string) {
  // 選択中の週だけ詳細表示にして、クリックした日の周辺を読み取りやすくする。
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
  const actual = getProjectDailyActualMinutes(project.id, dateKey);

  return Boolean((entry && entry.planned > 0) || actual > 0);
}

function dailyEntry(projectId: string): DailyWorkEntry {
  const project = projects.value.find((item) => item.id === projectId);

  return project?.dailyWorkEntries[selectedDate.value] ?? {
    planned: 0,
    actual: 0,
  };
}

function dailyActual(projectId: string) {
  return getProjectDailyActualMinutes(projectId, selectedDate.value);
}

function projectRequiredWork(project: Project) {
  return calculateRemainingWork(project.pages, project.workProcessSteps);
}

function projectPlannedTotal(project: Project) {
  // 予定の割り振り過ぎを防ぐため、全日付の予定分だけを集計する。
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
  // その日に入力済みの予定は残しつつ、未割り振り分だけ追加可能にする。
  return Math.max(current.planned + projectUnplannedWork(project), 0);
}

function normalizePlannedEntry(projectId: string, value: number) {
  // 入力値は0以上、かつ残作業時間を超えない範囲へ丸める。
  return Math.max(0, Math.min(Number.isFinite(value) ? value : 0, maxPlannedEntry(projectId)));
}

function handlePlannedEntry(projectId: string, event: Event) {
  const current = dailyEntry(projectId);
  const input = event.target as HTMLInputElement;
  const planned = normalizePlannedEntry(projectId, minutesToWork(Number(input.value)));
  input.value = String(workToMinutes(planned));

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
