<template>
  <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]">
    <NuxtLink
      :to="`/projects/${project.id}`"
      class="flex items-center gap-2 font-black text-[#263236] hover:text-[#2c8d98]"
    >
      <span
        class="h-2.5 w-2.5 shrink-0 rounded-full"
        :style="{ backgroundColor: color }"
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
        :aria-label="`作業時間 ${formatWorkDuration(actual)}、予定 ${formatWorkDuration(planned)}`"
      >
        <div
          v-for="(column, columnIndex) in workBarColumns"
          :key="columnIndex"
          class="grid gap-1.5"
          :class="workBarColumns.length > 1 ? 'w-12' : 'w-24'"
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
          v-if="workBarColumns.length === 0"
          class="h-3 w-24 rounded-sm border-2 border-dashed border-[#2c8d98]/30"
        />
      </div>

      <dl class="flex items-start gap-4">
        <div v-if="dateMode !== 'future'" class="grid gap-2">
          <dt class="text-sm font-black text-[#263236]">
            実績
          </dt>
          <dd class="text-xl font-black text-[#263236]">
            {{ formatWorkDuration(actual) }}
          </dd>
        </div>
        <!-- 見出し1行分（20px）と行間（8px）を空けて、時間の数字と高さをそろえる。 -->
        <div
          v-if="dateMode !== 'future'"
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
              {{ formatWorkDuration(planned) }}
            </span>
            <button
              v-if="dateMode !== 'past'"
              type="button"
              class="inline-flex min-h-10 items-center text-xs font-black text-[#f36b00] underline-offset-2 hover:underline"
              aria-haspopup="dialog"
              aria-label="今日〜締切の予定を自動で割り振る"
              @click="emit('openAllocation')"
            >
              自動割り振り ›
            </button>
          </dd>
          <dd v-if="dateMode !== 'past'" class="flex gap-1.5">
            <button
              v-for="step in plannedSteps"
              :key="step.amount"
              type="button"
              :aria-label="step.ariaLabel"
              class="min-h-10 min-w-14 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-2 text-xs font-black text-[#263236] transition hover:border-[#2c8d98] hover:bg-[#edf6fa]"
              @click="emit('adjustPlanned', step.amount)"
            >
              {{ step.label }}
            </button>
          </dd>
        </div>
      </dl>
    </div>

    <div
      v-if="dateMode !== 'past' && (clampedMinutes || allocationDone)"
      class="mt-3 grid gap-1"
    >
      <p
        v-if="clampedMinutes"
        class="text-xs font-bold text-[#f36b00]"
        role="status"
      >
        残り作業時間を超えるため、{{ formatWorkDuration(clampedMinutes) }} に合わせました。
      </p>

      <p
        v-if="allocationDone"
        class="text-xs font-bold text-[#2c8d98]"
        role="status"
      >
        予定を割り振りました。
      </p>
    </div>

    <CalendarDailyPageProgress
      v-if="dateMode !== 'future'"
      v-model:show-completed="showCompleted"
      :project="project"
      :date-key="dateKey"
      @change="(pageNumber, status) => emit('changePage', pageNumber, status)"
    />
  </div>
</template>

<script setup lang="ts">
import type { PageStatus, Project } from "~~/types/project";
import { useProgress } from "~/composables/useProgress";
import type { DateMode } from "~/utils/calendarSchedule";
import { formatProjectDate } from "~/utils/projectDisplay";
import {
  createWorkBars,
  getWorkBarClass,
  getWorkBarStyle,
} from "~/utils/workBars";

const props = defineProps<{
  project: Project;
  color?: string;
  dateKey: string;
  dateMode: DateMode;
  planned: number;
  actual: number;
  clampedMinutes?: number;
  allocationDone?: boolean;
}>();

// パネルを閉じても残るように、表示の切り替えはページ側で保持する。
const showCompleted = defineModel<boolean>("showCompleted");

const emit = defineEmits<{
  adjustPlanned: [amount: number];
  openAllocation: [];
  changePage: [pageNumber: number, status: PageStatus];
}>();

// カード内のバーは圧縮せず、この本数ごとに右の列へ積み上げる。
const workBarsPerColumn = 8;
const plannedSteps = [
  { amount: -30, label: "−30m", ariaLabel: "予定を30分減らす" },
  { amount: 30, label: "+30m", ariaLabel: "予定を30分増やす" },
];

const { formatWorkDuration } = useProgress();

const workBarColumns = computed(() => {
  const bars = createWorkBars(
    {
      planned: props.planned,
      actual: props.actual,
    },
    Infinity
  );
  const columns: typeof bars[] = [];

  // barsは上（大きいlevel）から並ぶので、levelで列を決めて下から8本ずつ積む。
  for (const bar of bars) {
    const columnIndex = Math.floor(bar.level / workBarsPerColumn);
    (columns[columnIndex] ??= []).push(bar);
  }

  return columns;
});
</script>
