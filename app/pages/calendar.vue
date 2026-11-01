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
          <CalendarMonthHeader
            :title="monthTitle"
            :totals="monthTotals"
            @move="moveMonth"
            @today="goToday"
          />

          <CalendarProjectLegend
            v-if="projects.length"
            :projects="projects"
            :colors="projectColors"
          />

          <div class="grid grid-cols-7 border-b-2 border-[#2c8d98] bg-[#edf6fa]">
            <div
              v-for="weekday in WEEKDAY_LABELS"
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

        <CalendarWorkPanel
          :open="isWorkPanelOpen"
          :date-key="selectedDate"
          :date-mode="selectedDateMode"
          :schedule="selectedSchedule"
          :has-projects="projects.length > 0"
          :has-editable-projects="editableProjects.length > 0"
          @close="closeWorkPanel"
        >
          <CalendarProjectWorkCard
            v-for="project in editableProjects"
            :key="project.id"
            v-model:show-completed="showCompletedPages[project.id]"
            :project="project"
            :color="projectColors[project.id]"
            :date-key="selectedDate"
            :date-mode="selectedDateMode"
            :planned="dailyEntry(project.id).planned"
            :actual="dailyActual(project.id)"
            :clamped-minutes="plannedClampNotices[project.id]"
            :allocation-done="allocationDoneNotices[project.id]"
            @adjust-planned="adjustPlannedEntry(project.id, $event)"
            @open-allocation="openAllocationDialog(project.id)"
            @change-page="(pageNumber, status) => updatePageStatusForSelectedDate(project.id, pageNumber, status)"
          />
        </CalendarWorkPanel>

        <CalendarAllocationDialog
          v-if="allocationTarget && allocationPlan"
          :options="allocationOptionsFor(allocationTarget.id)"
          :project-title="allocationTarget.title"
          :plan="allocationPlan"
          @update:options="allocationOptions[allocationTarget.id] = $event"
          @close="closeAllocationDialog"
          @confirm="confirmAllocation"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { PageStatus, Project } from "~~/types/project";
import { WEEKDAY_LABELS } from "~/constants/calendar";
import { useCalendarMonth } from "~/composables/useCalendarMonth";
import { useDailyPlan } from "~/composables/useDailyPlan";
import { useProgress } from "~/composables/useProgress";
import { useProjects } from "~/composables/useProjects";
import {
  buildAllocationPlan,
  formatDateKey,
  parseDateKey,
  type AllocationOptions,
} from "~/utils/planAllocation";
import { fallbackProjectColor, getProjectColor } from "~/utils/projectColors";
import {
  dayProjectTotals,
  daySchedule,
  isWithinWorkPeriod,
  sumWorkTotals,
  type DateMode,
} from "~/utils/calendarSchedule";

const {
  projects,
  loadProjects,
  updatePageStatus,
  getProjectDailyActualMinutes,
} = useProjects();
const { calculateRemainingWork } = useProgress();

const route = useRoute();
const initialDate = parseDateKeyFromQuery(route.query.date) ?? new Date();
const selectedDate = ref(formatDateKey(initialDate));
const isWorkPanelOpen = ref(Boolean(route.query.date));
const showCompletedPages = ref<Record<string, boolean>>({});
// 自動割り振りのオプションは保存せず、画面を開いている間だけプロジェクト別に保持する。
const allocationOptions = ref<Record<string, AllocationOptions>>({});
const allocationTargetId = ref<string | null>(null);

const {
  monthTitle,
  calendarDays,
  moveMonth,
  showMonthOf,
} = useCalendarMonth(initialDate);
const {
  plannedClampNotices,
  allocationDoneNotices,
  dailyEntry,
  dailyActual,
  adjustPlannedEntry,
  clearAllocationDone,
  applyAllocation,
} = useDailyPlan(selectedDate);

onMounted(() => {
  loadProjects();
});

const projectColors = computed<Record<string, string>>(() => {
  return Object.fromEntries(
    projects.value.map((project, index) => [project.id, getProjectColor(index)])
  );
});

const dayCells = computed(() => {
  return calendarDays.value.map((day) => {
    const projectTotals = dayProjectTotals(projects.value, day.dateKey, getProjectDailyActualMinutes);

    return {
      day,
      totals: sumWorkTotals(projectTotals),
      schedule: daySchedule(projects.value, day.dateKey),
      projectDots: projectTotals.map(({ project }) => ({
        id: project.id,
        title: project.title,
        color: projectColors.value[project.id] ?? fallbackProjectColor,
      })),
    };
  });
});

const monthTotals = computed(() => {
  return sumWorkTotals(
    dayCells.value.filter((cell) => cell.day.isCurrentMonth).map((cell) => cell.totals)
  );
});

const selectedSchedule = computed(() => daySchedule(projects.value, selectedDate.value));

const selectedDateMode = computed<DateMode>(() => {
  const todayKey = formatDateKey(new Date());

  if (selectedDate.value < todayKey) return "past";
  if (selectedDate.value === todayKey) return "today";

  return "future";
});

const allocationTarget = computed(() => {
  return projects.value.find((project) => project.id === allocationTargetId.value) ?? null;
});

const allocationPlan = computed(() => {
  const project = allocationTarget.value;
  if (!project) return null;

  return buildAllocationPlan({
    project,
    options: allocationOptionsFor(project.id),
    remainingMinutes: calculateRemainingWork(project.pages, project.workProcessSteps),
    todayKey: formatDateKey(new Date()),
    getActualMinutes: (dateKey) => getProjectDailyActualMinutes(project.id, dateKey),
  });
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

function goToday() {
  const now = new Date();
  selectedDate.value = formatDateKey(now);
  showMonthOf(now);
}

function selectDate(dateKey: string) {
  selectedDate.value = dateKey;
  isWorkPanelOpen.value = true;
}

function closeWorkPanel() {
  isWorkPanelOpen.value = false;
}

function hasDailyEntry(project: Project, dateKey: string) {
  const entry = project.dailyWorkEntries[dateKey];
  const actual = getProjectDailyActualMinutes(project.id, dateKey);

  return Boolean((entry && entry.planned > 0) || actual > 0);
}

function allocationOptionsFor(projectId: string): AllocationOptions {
  // 描画中に状態を書き換えないよう、初期化はダイアログを開いたときに行う。
  return allocationOptions.value[projectId] ?? {
    weekendWeight: 1,
    restDays: [],
  };
}

function openAllocationDialog(projectId: string) {
  allocationOptions.value[projectId] ??= allocationOptionsFor(projectId);
  clearAllocationDone(projectId);
  allocationTargetId.value = projectId;
}

function closeAllocationDialog() {
  allocationTargetId.value = null;
}

function confirmAllocation() {
  const project = allocationTarget.value;
  const plan = allocationPlan.value;
  if (!project || !plan || plan.blockReason) return;

  applyAllocation(project.id, plan.plannedByDate);
  closeAllocationDialog();
}

function updatePageStatusForSelectedDate(projectId: string, pageNumber: number, status: PageStatus) {
  // カレンダーで選んだ日の作業ログとして、ページ進捗の差分を記録する。
  updatePageStatus(projectId, pageNumber, status, {
    workDate: selectedDate.value,
    syncDailyActual: true,
  });
}
</script>
