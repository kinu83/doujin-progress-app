<template>
  <main class="min-h-screen bg-[#edf6fa] px-4 py-6 text-[#263236] sm:px-6">
    <div class="mx-auto max-w-7xl">
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <div class="items-center gap-3">
          <UiBackLink />
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
            <div class="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
              <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
                <span class="h-2 w-8 rounded-full bg-[#2c8d98]" />
                実績
              </div>
              <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
                <span class="h-2 w-8 rounded-full border-2 border-[#2c8d98]/50 bg-white" />
                予定
              </div>
              <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
                <span class="h-2 w-8 rounded-full bg-[#f36b00]" />
                予定超過
              </div>
              <p class="text-sm font-black" :aria-label="`今月の実績 ${formatWorkDuration(monthTotals.actual)}、予定 ${formatWorkDuration(monthTotals.planned)}`">
                <span :class="monthTotals.actual > monthTotals.planned ? 'text-[#f36b00]' : 'text-[#2c8d98]'">
                  実績 {{ formatWorkDuration(monthTotals.actual) }}
                </span>
                <span class="text-[#263236]/40">
                  / 予定 {{ formatWorkDuration(monthTotals.planned) }}
                </span>
              </p>
            </div>
          </div>

          <ul
            v-if="projects.length"
            class="flex flex-wrap gap-x-4 gap-y-1 border-b-2 border-dashed border-[#2c8d98]/40 px-5 py-2"
            aria-label="プロジェクトの色"
          >
            <li
              v-for="project in projects"
              :key="project.id"
              class="flex min-w-0 items-center gap-1.5 text-xs font-black text-[#263236]/70"
            >
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-full"
                :style="{ backgroundColor: projectColors[project.id] }"
              />
              <span class="truncate">{{ project.title }}</span>
            </li>
          </ul>

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
            <CalendarDayCell
              v-for="cell in dayCells"
              :key="cell.day.dateKey"
              :day="cell.day"
              :totals="cell.totals"
              :schedule="cell.schedule"
              :project-dots="cell.projectDots"
              :selected="selectedDate === cell.day.dateKey"
              @select="selectDate"
            />
          </div>
        </section>

        <UiModal
          :open="isWorkPanelOpen"
          overlay-class="fixed inset-0 z-40 bg-[#263236]/20 backdrop-blur-[1px]"
          @close="closeWorkPanel"
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
              <UiCloseButton
                label="作業時間入力を閉じる"
                data-autofocus
                class="shadow-[3px_3px_0_rgba(38,50,54,0.14)] hover:-translate-y-0.5"
                @click="closeWorkPanel"
              />
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
                  {{ projectSectionTitle }}
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
                  <NuxtLink
                    :to="`/projects/${project.id}`"
                    class="flex items-center gap-2 font-black text-[#263236] hover:text-[#2c8d98]"
                  >
                    <span
                      class="h-2.5 w-2.5 shrink-0 rounded-full"
                      :style="{ backgroundColor: projectColors[project.id] }"
                      aria-hidden="true"
                    />
                    {{ project.title }}
                  </NuxtLink>

                  <div class="mt-1 flex items-center justify-between gap-3 text-xs font-black text-[#263236]/60">
                    <p class="flex min-w-0 flex-wrap gap-x-2">
                      <span v-if="project.eventDate">
                        {{ formatProjectDate(project.eventDate) }}
                      </span>
                      <span v-if="project.eventName.trim()" class="min-w-0 break-all">
                        {{ project.eventName.trim() }} 合わせ
                      </span>
                    </p>
                    <span class="shrink-0 rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-2 py-1 text-xs font-black text-[#2c8d98]">
                      {{ project.totalPages }}P
                    </span>
                  </div>

                  <div class="mt-5 flex items-center gap-6">
                    <div
                      class="flex shrink-0 items-end gap-1.5"
                      role="img"
                      :aria-label="`作業時間 ${formatWorkDuration(dailyActual(project.id))}、予定 ${formatWorkDuration(dailyEntry(project.id).planned)}`"
                    >
                      <div
                        v-for="(column, columnIndex) in projectWorkBarColumns(project.id)"
                        :key="columnIndex"
                        class="grid gap-1.5"
                        :class="projectWorkBarColumns(project.id).length > 1 ? 'w-12' : 'w-24'"
                      >
                        <span
                          v-for="bar in column"
                          :key="bar.level"
                          class="h-3 w-full rounded-sm border-2"
                          :class="getWorkBarClass(bar)"
                          :style="getWorkBarStyle(bar)"
                        />
                      </div>
                      <span
                        v-if="projectWorkBarColumns(project.id).length === 0"
                        class="h-3 w-24 rounded-sm border-2 border-dashed border-[#2c8d98]/30"
                      />
                    </div>

                    <dl class="flex items-start gap-4">
                      <div v-if="selectedDateMode !== 'future'" class="grid gap-2">
                        <dt class="text-sm font-black text-[#263236]">
                          実績
                        </dt>
                        <dd class="text-xl font-black text-[#263236]">
                          {{ formatWorkDuration(dailyActual(project.id)) }}
                        </dd>
                      </div>
                      <!-- 見出し1行分（20px）と行間（8px）を空けて、時間の数字と高さをそろえる。 -->
                      <div
                        v-if="selectedDateMode !== 'future'"
                        class="pt-7 text-xl font-black text-[#263236]/40"
                        aria-hidden="true"
                      >
                        /
                      </div>
                      <div class="grid gap-2">
                        <dt class="text-sm font-black text-[#263236]">
                          予定
                        </dt>
                        <dd class="flex flex-wrap items-center gap-x-3">
                          <span class="text-xl font-black text-[#2c8d98]">
                            {{ formatWorkDuration(dailyEntry(project.id).planned) }}
                          </span>
                          <button
                            v-if="selectedDateMode !== 'past'"
                            type="button"
                            class="inline-flex min-h-10 items-center text-xs font-black text-[#f36b00] underline-offset-2 hover:underline"
                            aria-haspopup="dialog"
                            aria-label="今日〜締切の予定を自動で割り振る"
                            @click="openAllocationDialog(project.id)"
                          >
                            自動割り振り ›
                          </button>
                        </dd>
                        <dd v-if="selectedDateMode !== 'past'" class="flex gap-1.5">
                          <button
                            v-for="step in plannedSteps"
                            :key="step.amount"
                            type="button"
                            :aria-label="step.ariaLabel"
                            class="min-h-10 min-w-14 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-2 text-xs font-black text-[#263236] transition hover:border-[#2c8d98] hover:bg-[#edf6fa]"
                            @click="adjustPlannedEntry(project.id, step.amount)"
                          >
                            {{ step.label }}
                          </button>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div
                    v-if="selectedDateMode !== 'past' && (plannedClampNotices[project.id] || allocationDoneNotices[project.id])"
                    class="mt-3 grid gap-1"
                  >
                    <p
                      v-if="plannedClampNotices[project.id]"
                      class="text-xs font-bold text-[#f36b00]"
                      role="status"
                    >
                      残り作業時間を超えるため、{{ formatWorkDuration(plannedClampNotices[project.id]) }} に合わせました。
                    </p>

                    <p
                      v-if="allocationDoneNotices[project.id]"
                      class="text-xs font-bold text-[#2c8d98]"
                      role="status"
                    >
                      予定を割り振りました。
                    </p>
                  </div>

                  <section
                    v-if="selectedDateMode !== 'future'"
                    class="mt-5 grid gap-2 border-t-2 border-dashed border-[#2c8d98]/40 pt-4"
                    :aria-labelledby="`page-progress-title-${project.id}`"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <h4
                        :id="`page-progress-title-${project.id}`"
                        class="text-sm font-black text-[#263236]"
                      >
                        実績入力
                      </h4>
                      <span class="text-xs font-black text-[#263236]/50">
                        未完了 {{ incompletePageCount(project) }}P
                      </span>
                    </div>

                    <label class="flex min-h-9 w-fit items-center gap-2 text-xs font-black text-[#263236]/60">
                      <input
                        v-model="showCompletedPages[project.id]"
                        type="checkbox"
                        class="h-4 w-4 accent-[#2c8d98]"
                      >
                      完了済みのページも表示
                    </label>

                    <div class="grid max-h-96 gap-2 overflow-y-auto pr-1">
                      <PageProgressSlider
                        v-for="page in visiblePages(project)"
                        :key="page.pageNumber"
                        :page="page"
                        :work-process-steps="project.workProcessSteps"
                        @change="updatePageStatusForSelectedDate(project.id, page.pageNumber, $event)"
                      />

                      <p
                        v-if="visiblePages(project).length === 0"
                        class="rounded-xl bg-[#edf6fa] px-3 py-2 text-center text-xs font-bold text-[#263236]/60"
                      >
                        すべてのページが完了しています。
                      </p>
                    </div>
                  </section>
                </div>
              </section>
            </div>
          </aside>
        </UiModal>

        <UiModal
          :open="Boolean(allocationTarget)"
          overlay-class="fixed inset-0 z-50 grid place-items-center bg-[#263236]/30 px-4"
          @close="closeAllocationDialog"
        >
          <div
            v-if="allocationTarget"
            class="grid max-h-[90vh] w-full max-w-sm gap-3 overflow-y-auto rounded-2xl border-4 border-[#2c8d98] bg-white p-5 shadow-[5px_5px_0_rgba(44,141,152,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="allocation-dialog-title"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 id="allocation-dialog-title" class="text-base font-black text-[#263236]">
                  自動で割り振る
                </h2>
                <p class="mt-1 text-xs font-black text-[#263236]/60">
                  {{ allocationTarget.title }}
                </p>
              </div>
              <UiCloseButton
                label="自動割り振りを閉じる"
                size="lg"
                data-autofocus
                @click="closeAllocationDialog"
              />
            </div>

            <p class="text-xs font-bold text-[#263236]/60">
              今日から締切までの残り作業を、日ごとに均等に割り振ります。
            </p>

            <label class="grid gap-1 text-xs font-black text-[#263236]/60">
              土日の重み
              <select
                v-model.number="allocationOptionsFor(allocationTarget.id).weekendWeight"
                class="min-h-11 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-3 text-sm font-bold text-[#263236] outline-none focus:border-[#2c8d98]"
                @change="isConfirmingAllocation = false"
              >
                <option
                  v-for="weight in weekendWeights"
                  :key="weight"
                  :value="weight"
                >
                  ×{{ weight }}
                </option>
              </select>
            </label>

            <fieldset class="grid gap-1">
              <legend class="text-xs font-black text-[#263236]/60">
                作業しない曜日
              </legend>
              <div class="grid grid-cols-7 gap-1">
                <label
                  v-for="(weekday, index) in weekdays"
                  :key="weekday"
                  class="flex min-h-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-xs font-black transition"
                  :class="allocationOptionsFor(allocationTarget.id).restDays.includes(index)
                    ? 'border-[#263236]/40 bg-[#263236]/10 text-[#263236]/60'
                    : 'border-[#2c8d98]/40 bg-white text-[#263236]'"
                >
                  <input
                    v-model="allocationOptionsFor(allocationTarget.id).restDays"
                    type="checkbox"
                    :value="index"
                    class="h-3.5 w-3.5 accent-[#263236]"
                    @change="isConfirmingAllocation = false"
                  >
                  {{ weekday }}
                </label>
              </div>
            </fieldset>

            <p
              v-if="allocationPlan?.blockReason"
              class="rounded-xl bg-[#edf6fa] px-3 py-2 text-xs font-bold text-[#263236]/60"
            >
              {{ allocationPlan.blockReason }}
            </p>

            <template v-else-if="allocationPlan">
              <div
                v-if="isConfirmingAllocation"
                class="grid gap-2 rounded-xl border-2 border-[#f36b00]/40 bg-[#fff2e3] p-3 text-xs font-bold text-[#263236]"
                role="alert"
              >
                <p>
                  {{ formatAllocationRange(allocationPlan) }} の {{ allocationPlan.workDayCount }}日<span v-if="allocationPlan.restDayCount">（休み {{ allocationPlan.restDayCount }}日）</span>に
                  {{ formatWorkDuration(allocationPlan.totalMinutes) }} を割り振ります。
                </p>
                <p v-if="allocationPlan.weekdayRange">
                  平日 {{ formatMinutesRange(allocationPlan.weekdayRange) }}
                </p>
                <p v-if="allocationPlan.weekendRange">
                  土日 {{ formatMinutesRange(allocationPlan.weekendRange) }}
                </p>
                <p
                  v-if="allocationPlan.overwriteCount"
                  class="font-black text-[#f36b00]"
                >
                  既存の予定 {{ allocationPlan.overwriteCount }}日分は上書きされます。
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="min-h-11 flex-1 rounded-xl border-2 border-[#f36b00] bg-[#f36b00] px-3 text-xs font-black text-white transition hover:bg-[#e06200]"
                    @click="confirmAllocation"
                  >
                    {{ allocationPlan.overwriteCount ? '上書きする' : '割り振る' }}
                  </button>
                  <button
                    type="button"
                    class="min-h-11 flex-1 rounded-xl border-2 border-[#263236]/30 bg-white px-3 text-xs font-black text-[#263236] transition hover:bg-[#f7fcfd]"
                    @click="isConfirmingAllocation = false"
                  >
                    やめる
                  </button>
                </div>
              </div>

              <button
                v-else
                type="button"
                class="min-h-11 rounded-xl border-2 border-[#2c8d98] bg-[#2c8d98] px-3 text-sm font-black text-white transition hover:bg-[#247a84]"
                @click="isConfirmingAllocation = true"
              >
                割り振る
              </button>
            </template>
          </div>
        </UiModal>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { DailyWorkEntry, PageStatus, Project } from "~/types/project";
import { useProjects } from "~/composables/useProjects";
import { createStatusList, useProgress } from "~/composables/useProgress";
import {
  allocatePlannedMinutes,
  formatDateKey,
  listDateKeys,
  parseDateKey,
} from "~/utils/planAllocation";
import { formatProjectDate } from "~/utils/projectDisplay";
import { getProjectColor } from "~/utils/projectColors";
import {
  scheduleClasses,
  scheduleLabels,
  type ScheduleItem,
  type ScheduleKind,
} from "~/utils/calendarSchedule";
import {
  createWorkBars,
  getWorkBarClass,
  getWorkBarStyle,
  type WorkTotals,
} from "~/utils/workBars";

type DateMode = "past" | "today" | "future";

type AllocationOptions = {
  weekendWeight: number;
  restDays: number[];
};

type MinutesRange = {
  min: number;
  max: number;
};

type AllocationPlan = {
  blockReason?: string;
  plannedByDate: Record<string, number>;
  from: string;
  to: string;
  totalMinutes: number;
  workDayCount: number;
  restDayCount: number;
  weekdayRange?: MinutesRange;
  weekendRange?: MinutesRange;
  overwriteCount: number;
};

type DayProjectTotals = WorkTotals & {
  project: Project;
};

const {
  projects,
  loadProjects,
  updateDailyWorkEntry,
  replacePlannedEntries,
  updatePageStatus,
  getProjectDailyActualMinutes,
} = useProjects();
const {
  calculateRemainingWork,
  formatWorkDuration,
} = useProgress();

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
// カード内のバーは圧縮せず、この本数ごとに右の列へ積み上げる。
const projectWorkBarsPerColumn = 8;
const plannedSteps = [
  { amount: -30, label: "−30m", ariaLabel: "予定を30分減らす" },
  { amount: 30, label: "+30m", ariaLabel: "予定を30分増やす" },
];
const weekendWeights = [1, 1.5, 2];
// Firestoreルールの日付キー上限（dailyWorkEntries.keys().size() <= 800）に合わせる。
const maxDailyEntryCount = 800;

const route = useRoute();
const today = new Date();
const initialDate = parseDateKeyFromQuery(route.query.date) ?? today;
const selectedDate = ref(formatDateKey(initialDate));
const visibleYear = ref(initialDate.getFullYear());
const visibleMonth = ref(initialDate.getMonth());
const isWorkPanelOpen = ref(Boolean(route.query.date));
// 上限に丸めた入力だけ、丸めた後の値をプロジェクト別に表示する。
const plannedClampNotices = ref<Record<string, number>>({});
const showCompletedPages = ref<Record<string, boolean>>({});
// 自動割り振りのオプションは保存せず、画面を開いている間だけプロジェクト別に保持する。
const allocationOptions = ref<Record<string, AllocationOptions>>({});
const allocationTargetId = ref<string | null>(null);
const isConfirmingAllocation = ref(false);
const allocationDoneNotices = ref<Record<string, boolean>>({});

onMounted(() => {
  loadProjects();
});

watch(selectedDate, () => {
  plannedClampNotices.value = {};
  allocationDoneNotices.value = {};
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

const projectColors = computed<Record<string, string>>(() => {
  return Object.fromEntries(
    projects.value.map((project, index) => [project.id, getProjectColor(index)])
  );
});

const dayCells = computed(() => {
  return calendarDays.value.map((day) => {
    const projectTotals = dayProjectTotals(day.dateKey);

    return {
      day,
      totals: sumWorkTotals(projectTotals),
      schedule: daySchedule(day.dateKey),
      projectDots: projectTotals.map(({ project }) => ({
        id: project.id,
        title: project.title,
        color: projectColors.value[project.id],
      })),
    };
  });
});

const monthTotals = computed(() => {
  return sumWorkTotals(
    dayCells.value.filter((cell) => cell.day.isCurrentMonth).map((cell) => cell.totals)
  );
});

const selectedSchedule = computed(() => daySchedule(selectedDate.value));

const selectedDateMode = computed<DateMode>(() => {
  const todayKey = formatDateKey(new Date());

  if (selectedDate.value < todayKey) return "past";
  if (selectedDate.value === todayKey) return "today";

  return "future";
});

const projectSectionTitle = computed(() => {
  const titles: Record<DateMode, string> = {
    past: "プロジェクト別実績",
    today: "プロジェクト別予定・実績",
    future: "プロジェクト別予定",
  };

  return titles[selectedDateMode.value];
});

const allocationTarget = computed(() => {
  return projects.value.find((project) => project.id === allocationTargetId.value) ?? null;
});

const allocationPlan = computed(() => {
  return allocationTarget.value ? buildAllocationPlan(allocationTarget.value) : null;
});

const editableProjects = computed(() => {
  return projects.value.filter((project) => {
    // 作業期間外でも、すでに予定や実績がある日は編集できるように残す。
    return isWithinWorkPeriod(project, selectedDate.value) || hasDailyEntry(project, selectedDate.value);
  });
});

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

function dayProjectTotals(dateKey: string): DayProjectTotals[] {
  return projects.value.flatMap((project) => {
    const planned = project.dailyWorkEntries[dateKey]?.planned ?? 0;
    const actual = getProjectDailyActualMinutes(project.id, dateKey);
    // 予定も実績もない日は、作業期間内でも合計やドットに含めない。
    if (planned === 0 && actual === 0) return [];

    return [{ project, planned, actual }];
  });
}

function sumWorkTotals(totalsList: WorkTotals[]): WorkTotals {
  return totalsList.reduce(
    (sum, totals) => ({
      planned: sum.planned + totals.planned,
      actual: sum.actual + totals.actual,
    }),
    { planned: 0, actual: 0 }
  );
}

function projectWorkBarColumns(projectId: string) {
  const bars = createWorkBars(
    {
      planned: dailyEntry(projectId).planned,
      actual: dailyActual(projectId),
    },
    Infinity
  );
  const columns: typeof bars[] = [];

  // barsは上（大きいlevel）から並ぶので、levelで列を決めて下から8本ずつ積む。
  for (const bar of bars) {
    const columnIndex = Math.floor(bar.level / projectWorkBarsPerColumn);
    (columns[columnIndex] ??= []).push(bar);
  }

  return columns;
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

function plannedLoad(project: Project, dateKey: string, planned: number) {
  const todayKey = formatDateKey(new Date());
  // 過去日の予定は残作業時間とは無関係なので、割り振り済みとして数えない。
  if (dateKey < todayKey) return 0;
  // 今日はすでに進めた分が残作業時間から減っているため、その分を予定から差し引く。
  if (dateKey === todayKey) {
    return Math.max(planned - getProjectDailyActualMinutes(project.id, dateKey), 0);
  }

  return planned;
}

function projectPlannedTotal(project: Project) {
  // 予定の割り振り過ぎを防ぐため、残作業時間に対応する今日以降の予定だけを集計する。
  return Object.entries(project.dailyWorkEntries).reduce((sum, [dateKey, entry]) => {
    return sum + plannedLoad(project, dateKey, entry.planned);
  }, 0);
}

function maxPlannedEntry(projectId: string) {
  const project = projects.value.find((item) => item.id === projectId);
  if (!project) return 0;

  const dateKey = selectedDate.value;
  const current = dailyEntry(projectId);
  const otherPlanned = projectPlannedTotal(project) - plannedLoad(project, dateKey, current.planned);
  const available = Math.max(projectRequiredWork(project) - otherPlanned, 0);
  const todayKey = formatDateKey(new Date());

  // 過去日は入力済みの予定を削らないようにし、今日は進めた分を上乗せして入力できるようにする。
  if (dateKey < todayKey) return Math.max(current.planned, available);
  if (dateKey === todayKey) return available + dailyActual(projectId);

  return available;
}

function savePlannedEntry(projectId: string, minutes: number) {
  const current = dailyEntry(projectId);
  const requested = Math.max(0, Math.round(Number.isFinite(minutes) ? minutes : 0));
  const planned = Math.min(requested, maxPlannedEntry(projectId));

  if (planned < requested) {
    plannedClampNotices.value[projectId] = planned;
  } else {
    delete plannedClampNotices.value[projectId];
  }

  if (planned === current.planned) return planned;

  updateDailyWorkEntry(projectId, selectedDate.value, {
    ...current,
    planned,
  });

  return planned;
}

function adjustPlannedEntry(projectId: string, amount: number) {
  savePlannedEntry(projectId, dailyEntry(projectId).planned + amount);
}

function remainingWorkDateKeys(project: Project) {
  return listDateKeys(formatDateKey(new Date()), project.deadline);
}

function allocationOptionsFor(projectId: string): AllocationOptions {
  // 描画中に状態を書き換えないよう、初期化はダイアログを開いたときに行う。
  return allocationOptions.value[projectId] ?? {
    weekendWeight: 1,
    restDays: [],
  };
}

function allocationWeight(options: AllocationOptions, dateKey: string) {
  const weekday = parseDateKey(dateKey).getDay();
  if (options.restDays.includes(weekday)) return 0;

  return isWeekend(weekday) ? options.weekendWeight : 1;
}

function isWeekend(weekday: number) {
  return weekday === 0 || weekday === 6;
}

function buildAllocationPlan(project: Project): AllocationPlan {
  const todayKey = formatDateKey(new Date());
  const options = allocationOptionsFor(project.id);
  const dateKeys = remainingWorkDateKeys(project);
  const totalMinutes = projectRequiredWork(project);
  const workDateKeys = dateKeys.filter((dateKey) => allocationWeight(options, dateKey) > 0);
  const plan: AllocationPlan = {
    plannedByDate: {},
    from: dateKeys[0] ?? todayKey,
    to: project.deadline,
    totalMinutes,
    workDayCount: workDateKeys.length,
    restDayCount: dateKeys.length - workDateKeys.length,
    overwriteCount: Object.entries(project.dailyWorkEntries)
      .filter(([dateKey, entry]) => dateKey >= todayKey && entry.planned > 0)
      .length,
  };

  if (totalMinutes <= 0) return { ...plan, blockReason: "残り作業時間がないため、割り振る予定はありません。" };
  if (dateKeys.length === 0) return { ...plan, blockReason: "締切を過ぎているため、割り振れません。" };
  if (workDateKeys.length === 0) return { ...plan, blockReason: "作業する曜日を1つ以上残してください。" };

  const allocated = allocatePlannedMinutes({
    totalMinutes,
    dateKeys,
    weightOf: (dateKey) => allocationWeight(options, dateKey),
  });
  const weekdayMinutes: number[] = [];
  const weekendMinutes: number[] = [];

  for (const dateKey of workDateKeys) {
    const minutes = allocated[dateKey] ?? 0;
    (isWeekend(parseDateKey(dateKey).getDay()) ? weekendMinutes : weekdayMinutes).push(minutes);
  }

  // 今日の作業済み分は残り作業時間から引かれているため、予定には上乗せして保存する。
  const plannedByDate = Object.fromEntries(
    Object.entries(allocated).map(([dateKey, minutes]) => [
      dateKey,
      dateKey === todayKey ? minutes + getProjectDailyActualMinutes(project.id, dateKey) : minutes,
    ])
  );

  const remainingKeys = Object.keys(project.dailyWorkEntries).filter((dateKey) => {
    return dateKey < todayKey || getProjectDailyActualMinutes(project.id, dateKey) > 0;
  });
  const resultingKeys = new Set([
    ...remainingKeys,
    ...Object.keys(plannedByDate).filter((dateKey) => plannedByDate[dateKey] > 0),
  ]);
  if (resultingKeys.size > maxDailyEntryCount) {
    return { ...plan, blockReason: "期間が長すぎるため、自動割り振りできません。" };
  }

  return {
    ...plan,
    plannedByDate,
    weekdayRange: toMinutesRange(weekdayMinutes),
    weekendRange: toMinutesRange(weekendMinutes),
  };
}

function toMinutesRange(values: number[]): MinutesRange | undefined {
  if (values.length === 0) return undefined;

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function formatMinutesRange(range: MinutesRange) {
  if (range.min === range.max) return formatWorkDuration(range.min);

  return `${formatWorkDuration(range.min)}〜${formatWorkDuration(range.max)}`;
}

function formatAllocationRange(plan: AllocationPlan) {
  const format = (dateKey: string) => {
    const date = parseDateKey(dateKey);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return `${format(plan.from)}〜${format(plan.to)}`;
}

function openAllocationDialog(projectId: string) {
  allocationOptions.value[projectId] ??= allocationOptionsFor(projectId);
  delete allocationDoneNotices.value[projectId];
  isConfirmingAllocation.value = false;
  allocationTargetId.value = projectId;
}

function closeAllocationDialog() {
  allocationTargetId.value = null;
  isConfirmingAllocation.value = false;
}

function confirmAllocation() {
  const project = allocationTarget.value;
  const plan = allocationPlan.value;
  if (!project || !plan || plan.blockReason) return;

  // 今日以降の予定（締切後も含む）をまとめて置き換え、残り作業時間の上限を超えないようにする。
  replacePlannedEntries(project.id, formatDateKey(new Date()), plan.plannedByDate);
  delete plannedClampNotices.value[project.id];
  allocationDoneNotices.value[project.id] = true;
  closeAllocationDialog();
}

function isCompletedPage(project: Project, status: PageStatus) {
  const statuses = createStatusList(project.workProcessSteps);

  return status === statuses[statuses.length - 1];
}

function incompletePageCount(project: Project) {
  return project.pages.filter((page) => !isCompletedPage(project, page.status)).length;
}

function visiblePages(project: Project) {
  if (showCompletedPages.value[project.id]) return project.pages;

  // この日に進めたページは完了しても一覧から消さず、直前の操作を戻せるようにする。
  const touchedPageNumbers = new Set(
    project.workLogs
      .filter((log) => log.kind === "pageStatus" && log.workDate === selectedDate.value)
      .map((log) => log.pageNumber)
  );

  return project.pages.filter((page) => {
    return !isCompletedPage(project, page.status) || touchedPageNumbers.has(page.pageNumber);
  });
}

function updatePageStatusForSelectedDate(projectId: string, pageNumber: number, status: PageStatus) {
  // カレンダーで選んだ日の作業ログとして、ページ進捗の差分を記録する。
  updatePageStatus(projectId, pageNumber, status, {
    workDate: selectedDate.value,
    syncDailyActual: true,
  });
}
</script>
