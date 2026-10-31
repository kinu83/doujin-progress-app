<template>
  <div class="mt-4">
    <div class="text-right font-black text-[#263236]">
      <p class="text-4xl leading-none">
        {{ projectProgress }}%
      </p>
      <p class="text-sm">
        全体進捗
      </p>
    </div>

    <div class="mt-5 h-5 overflow-hidden rounded-full bg-[#d7d7d7] shadow-inner">
      <div
        class="h-full rounded-full bg-[#2c8d98] shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)]"
        :style="{ width: `${projectProgress}%` }"
      />
    </div>

    <div
      class="mt-5 rounded-2xl border-2 p-4 font-bold shadow-[3px_3px_0_rgba(38,50,54,0.12)]"
      :class="getCrunchLevelClasses(projectCrunchLevel.tone)"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-black">
            修羅場レベル
          </p>
          <p class="mt-1 text-2xl font-black">
            {{ projectCrunchLevel.label }}
          </p>
        </div>
        <div class="flex gap-1" aria-hidden="true">
          <span
            v-for="level in 5"
            :key="level"
            class="h-3 w-3 rounded-full"
            :class="level <= projectCrunchLevel.intensity ? 'bg-current' : 'bg-current/20'"
          />
        </div>
      </div>
      <p class="mt-2 text-sm leading-6">
        {{ projectCrunchLevel.message }}
      </p>
    </div>

    <div class="mt-5 grid gap-3 text-sm text-[#263236] md:grid-cols-4">
      <NuxtLink
        :to="{ path: '/calendar', query: { date: todayKey } }"
        class="rounded-2xl border-2 border-[#ff4b1f] bg-[#fff2e3] p-4 font-black shadow-[3px_3px_0_rgba(255,75,31,0.22)] transition hover:-translate-y-0.5 hover:bg-[#fff7ef]"
      >
        <span class="block text-xs">今日の必要時間</span>
        <span class="text-2xl leading-tight text-[#f36b00]">{{ formatWorkDuration(projectDailyWork) }}</span>
      </NuxtLink>
      <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 font-black shadow-[3px_3px_0_rgba(44,141,152,0.2)]">
        <span class="block text-xs">残り日数</span>
        <span class="text-2xl leading-tight text-[#2c8d98]">{{ calculateDaysLeft(project.deadline) }}日</span>
      </div>
      <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 font-black shadow-[3px_3px_0_rgba(44,141,152,0.2)]">
        <span class="block text-xs">残ページ数</span>
        <span class="text-2xl leading-tight text-[#2c8d98]">{{ remainingPagesLabel }}P</span>
      </div>
      <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 font-black shadow-[3px_3px_0_rgba(44,141,152,0.2)]">
        <span class="block text-xs">残り作業時間</span>
        <span class="text-2xl leading-tight text-[#2c8d98]">{{ formatWorkDuration(projectRemainingWork) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProgress } from "~/composables/useProgress";
import type { Project } from "~/types/project";
import { getCrunchLevelClasses } from "~/utils/crunchLevelDisplay";
import { formatDateKey } from "~/utils/planAllocation";

const props = defineProps<{
  project: Project;
}>();

const { settings } = useSettings();
const {
  calculateTotalProgress,
  calculateRemainingWork,
  calculateDaysLeft,
  calculateDailyWork,
  calculateCrunchLevel,
  formatWorkDuration,
} = useProgress();

const todayKey = computed(() => formatDateKey(new Date()));
const projectProgress = computed(() => {
  return calculateTotalProgress(props.project.pages, props.project.workProcessSteps);
});
const projectRemainingWork = computed(() => {
  return calculateRemainingWork(props.project.pages, props.project.workProcessSteps);
});
const projectDailyWork = computed(() => {
  return calculateDailyWork(props.project.pages, props.project.deadline, props.project.workProcessSteps);
});
const projectCrunchLevel = computed(() => {
  // 設定画面のしきい値を反映して、作品ごとに現在の危険度を再計算する。
  return calculateCrunchLevel(
    props.project.pages,
    props.project.deadline,
    props.project.startDate,
    props.project.workProcessSteps,
    settings.value.crunchThresholds
  );
});
const remainingPagesLabel = computed(() => {
  const { pages, totalPages, workProcessSteps } = props.project;
  // 最後の工程に到達したページだけを完了ページとして数える。
  const finalStatus = workProcessSteps[workProcessSteps.length - 1]?.name;
  const completedPages = pages.filter((page) => page.status === finalStatus).length;
  const remainingPages = Math.max(totalPages - completedPages, 0);

  return `${remainingPages}/${totalPages}`;
});
</script>
