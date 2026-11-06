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
          @update:options="updateAllocationOptions(allocationTarget.id, $event)"
          @close="closeAllocationDialog"
          @confirm="confirmAllocation"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { PageStatus } from "~~/types/project";
import { WEEKDAY_LABELS } from "~/constants/calendar";
import { useAllocationDialog } from "~/composables/useAllocationDialog";
import { useCalendarMonth } from "~/composables/useCalendarMonth";
import { useDailyPlan } from "~/composables/useDailyPlan";
import { useProjects } from "~/composables/useProjects";
import { formatDateKey, parseDateKeyFromQuery } from "~/utils/planAllocation";
import { fallbackProjectColor, getProjectColor } from "~/utils/projectColors";
import {
  dateModeOf,
  dayProjectTotals,
  daySchedule,
  editableProjectsOn,
  sumWorkTotals,
} from "~/utils/calendarSchedule";

const {
  projects,
  loadProjects,
  updatePageStatus,
  getProjectDailyActualMinutes,
} = useProjects();

const route = useRoute();
const initialDate = parseDateKeyFromQuery(route.query.date) ?? new Date();
const selectedDate = ref(formatDateKey(initialDate));
const isWorkPanelOpen = ref(Boolean(route.query.date));
const showCompletedPages = ref<Record<string, boolean>>({});

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
const {
  allocationTarget,
  allocationPlan,
  allocationOptionsFor,
  updateAllocationOptions,
  openAllocationDialog,
  closeAllocationDialog,
  confirmAllocation,
} = useAllocationDialog({ clearAllocationDone, applyAllocation });

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

const selectedDateMode = computed(() => dateModeOf(selectedDate.value, formatDateKey(new Date())));

const editableProjects = computed(() => {
  return editableProjectsOn(projects.value, selectedDate.value, getProjectDailyActualMinutes);
});

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

function updatePageStatusForSelectedDate(projectId: string, pageNumber: number, status: PageStatus) {
  // カレンダーで選んだ日の作業ログとして、ページ進捗の差分を記録する。
  updatePageStatus(projectId, pageNumber, status, {
    workDate: selectedDate.value,
    syncDailyActual: true,
  });
}
</script>
