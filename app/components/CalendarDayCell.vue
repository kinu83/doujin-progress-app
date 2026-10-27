<template>
  <button
    type="button"
    class="flex min-h-32 min-w-0 flex-col items-start justify-start border-b border-r border-[#2c8d98]/20 p-1 text-left transition hover:bg-[#f7fcfd] sm:min-h-36 sm:p-2"
    :class="[
      day.isCurrentMonth ? 'bg-white' : 'bg-[#edf6fa]/60 text-[#263236]/40',
      selected ? 'ring-2 ring-inset ring-[#2c8d98]' : '',
    ]"
    :aria-label="ariaLabel"
    :aria-pressed="selected"
    @click="emit('select', day.dateKey)"
  >
    <div class="flex w-full flex-wrap items-start justify-between gap-1">
      <!-- 日付の横に収まらない幅では、時間表示が日付の下へ折り返す。 -->
      <div class="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black sm:h-7 sm:w-7 sm:text-sm"
          :class="day.isToday ? 'bg-[#ff4b1f] text-white shadow-[2px_2px_0_rgba(255,75,31,0.24)]' : 'text-[#263236]'"
        >
          {{ day.dayNumber }}
        </span>
        <p
          v-if="hasWork"
          class="flex flex-wrap items-baseline gap-x-0.5 text-xs font-black leading-tight sm:text-sm"
          aria-hidden="true"
        >
          <span :class="isOver ? 'text-[#f36b00]' : 'text-[#2c8d98]'">
            {{ formatWorkDuration(totals.actual) }}
          </span>
          <span class="text-[#263236]/40">
            /{{ formatWorkDuration(totals.planned) }}
          </span>
        </p>
      </div>
      <span
        v-if="projectDots.length"
        class="flex flex-wrap justify-end gap-0.5 pt-1 sm:pt-1.5"
        aria-hidden="true"
      >
        <span
          v-for="dot in projectDots.slice(0, maxDots)"
          :key="dot.id"
          class="h-2 w-2 rounded-full"
          :style="{ backgroundColor: dot.color }"
          :title="dot.title"
        />
        <span
          v-if="projectDots.length > maxDots"
          class="text-[9px] font-black leading-2 text-[#263236]/50"
        >
          +{{ projectDots.length - maxDots }}
        </span>
      </span>
    </div>

    <div class="mt-1 grid w-full min-w-0 gap-1">
      <span
        v-for="item in schedule.slice(0, maxScheduleItems)"
        :key="`${item.projectId}-${item.kind}`"
        class="truncate rounded-md border px-1 py-0.5 text-[10px] font-black sm:px-2 sm:py-1 sm:text-[11px]"
        :class="scheduleClasses[item.kind]"
      >
        {{ scheduleLabels[item.kind] }} {{ item.title }}
      </span>
      <span
        v-if="schedule.length > maxScheduleItems"
        class="px-1 text-[10px] font-black text-[#263236]/40 sm:px-2 sm:text-[11px]"
      >
        他 {{ schedule.length - maxScheduleItems }} 件
      </span>
    </div>

    <div
      v-if="bars.length"
      class="mt-auto grid w-full gap-1 pt-2"
      aria-hidden="true"
    >
      <span
        v-for="bar in bars"
        :key="bar.level"
        class="h-1.5 w-full rounded-full border"
        :class="getWorkBarClass(bar)"
        :style="getWorkBarStyle(bar)"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import { useProgress } from "~/composables/useProgress";
import {
  scheduleClasses,
  scheduleLabels,
  type ScheduleItem,
} from "~/utils/calendarSchedule";
import {
  createWorkBars,
  getWorkBarClass,
  getWorkBarStyle,
  MAX_DAY_CELL_WORK_BARS,
  type WorkTotals,
} from "~/utils/workBars";

type CalendarDay = {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type ProjectDot = {
  id: string;
  title: string;
  color: string;
};

const props = defineProps<{
  day: CalendarDay;
  totals: WorkTotals;
  schedule: ScheduleItem[];
  projectDots: ProjectDot[];
  selected: boolean;
}>();

const emit = defineEmits<{
  select: [dateKey: string];
}>();

// スマホ幅（7列）でも1行に収まる個数だけ出す。
const maxDots = 3;
const maxScheduleItems = 3;

const { formatWorkDuration } = useProgress();

const hasWork = computed(() => props.totals.planned > 0 || props.totals.actual > 0);
const isOver = computed(() => props.totals.actual > props.totals.planned);
const bars = computed(() => createWorkBars(props.totals, MAX_DAY_CELL_WORK_BARS));

const ariaLabel = computed(() => {
  const parts = [`${props.day.dayNumber}日`];

  if (hasWork.value) {
    parts.push(`実績 ${formatWorkDuration(props.totals.actual)}、予定 ${formatWorkDuration(props.totals.planned)}`);
  }
  if (isOver.value) {
    parts.push("予定超過");
  }
  if (props.projectDots.length) {
    parts.push(`作業: ${props.projectDots.map((dot) => dot.title).join("、")}`);
  }
  for (const item of props.schedule) {
    parts.push(`${scheduleLabels[item.kind]} ${item.title}`);
  }

  return parts.join("。");
});
</script>
