<template>
  <main class="min-h-screen bg-[#edf6fa] px-6 py-8 text-[#263236]">
    <div class="mx-auto max-w-4xl">
      <div class="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 class="sr-only">同人原稿進捗管理</h1>
          <img
            src="/logo.png"
            alt="修羅場メーター"
            class="h-auto w-full max-w-[400px] drop-shadow-[3px_3px_0_#ffffff] sm:max-w-[400px]"
          >
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/calendar"
            aria-label="カレンダーを表示"
            title="カレンダー"
            class="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-xl border-2 border-[#263236] bg-white text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)] lg:w-auto lg:px-3"
          >
            <img src="/icon/calendar.svg" alt="" aria-hidden="true" class="h-5 w-5">
            <span class="hidden lg:inline">カレンダー</span>
          </NuxtLink>

          <NuxtLink
            to="/settings"
            aria-label="設定を開く"
            title="設定"
            class="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-xl border-2 border-[#263236] bg-white text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)] lg:w-auto lg:px-3"
          >
            <img src="/icon/setting.svg" alt="" aria-hidden="true" class="h-5 w-5">
            <span class="hidden lg:inline">設定</span>
          </NuxtLink>

          <NuxtLink
            to="/projects/new"
            class="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-xl border-2 border-[#263236] bg-[#2c8d98] text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.38)] transition hover:-translate-y-0.5 hover:bg-[#237984] hover:shadow-[4px_4px_0_rgba(38,50,54,0.42)] lg:w-auto lg:px-4"
          >
            <span class="grid h-6 w-6 place-items-center rounded-full bg-white text-[#2c8d98]">+</span>
            <span class="hidden lg:inline">新規作成</span>
          </NuxtLink>
        </div>
      </div>

      <div
        v-if="projects.length === 0"
        class="rounded-3xl border-4 border-dashed border-[#2c8d98] bg-white p-8 text-center shadow-[5px_5px_0_rgba(44,141,152,0.18)]"
      >
        <p class="text-base font-black text-[#263236]">
          まだプロジェクトがありません
        </p>
        <p class="mt-2 text-sm font-bold text-[#263236]/60">
          まずは 1 件作成して、1 日あたりの必要作業時間を確認しましょう。
        </p>
      </div>

      <ui v-else class="grid gap-4">
        <li v-for="card in projectCards" :key="card.project.id">
        <NuxtLink :to="`/projects/${card.project.id}`" class="block">
        <article
          class="rounded-3xl border-4 border-[#2c8d98] bg-white p-5 shadow-[5px_5px_0_rgba(44,141,152)] transition-all hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-none sm:px-12"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-col items-start gap-2 font-bold sm:flex-row sm:flex-wrap sm:items-center">
                <h2 class="wrap-break-words text-3xl font-black text-[#263236]">
                  {{ card.project.title }}
                </h2>
                <span
                  v-if="formatEventLabel(card.project)"
                  class="rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-3 py-1 text-xs font-black text-[#2c8d98]"
                >
                  {{ formatEventLabel(card.project) }}
                </span>
              </div>
              <div class="mt-4 grid gap-1 border-b-2 border-dashed border-[#2c8d98] pb-3 text-sm font-black text-[#263236] sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
                <span class="flex flex-wrap gap-x-2">
                  <span class="text-xs text-[#263236]/60">入稿締切日</span>
                  <span>{{ formatProjectDate(card.project.deadline) }}</span>
                </span>
                <span v-if="card.project.startDate" class="flex flex-wrap gap-x-2 sm:border-l-2 sm:border-[#2c8d98]/50 sm:pl-4">
                  <span class="text-xs text-[#263236]/60">作業開始日</span>
                  <span>{{ formatProjectDate(card.project.startDate) }}</span>
                </span>
              </div>
            </div>

            <div class="hidden shrink-0 flex-col items-end gap-2 sm:flex">
              <span
                class="rounded-xl border-2 px-3 py-1 text-xs font-black shadow-[3px_3px_0_rgba(38,50,54,0.16)]"
                :class="getCrunchLevelClasses(card.crunchLevel.tone)"
              >
                修羅場レベル: {{ card.crunchLevel.label }}
              </span>
              <span class="text-right text-xs font-black text-[#263236]">
                進捗
                <span class="block text-4xl leading-none">{{ card.progress }}%</span>
              </span>
            </div>
          </div>

          <div class="mt-6 h-5 overflow-hidden rounded-full bg-[#d7d7d7] shadow-inner">
            <div
              class="h-full rounded-full bg-[#2c8d98] shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)]"
              :style="{ width: `${card.progress}%` }"
            />
          </div>

          <div class="mt-4 grid gap-2 sm:hidden">
            <span class="text-right text-xs font-black text-[#263236]">
              進捗
              <span class="block text-4xl leading-none">{{ card.progress }}%</span>
            </span>
            <span
              class="rounded-xl border-2 px-3 py-1 text-xs font-black"
              :class="getCrunchLevelClasses(card.crunchLevel.tone)"
            >
              修羅場レベル: {{ card.crunchLevel.label }}
            </span>
          </div>

          <div class="mt-6 flex flex-wrap gap-3 text-sm text-[#263236]">
            <span
              class="min-w-0 w-full rounded-2xl border-2 border-[#ff4b1f] bg-[#fff2e3] px-4 py-3 font-black sm:flex-1"
            >
              <span class="block text-xs">今日の必要時間</span>
              <span class="text-3xl leading-tight text-[#f36b00]">{{ formatWorkDuration(card.dailyWork) }}</span>
            </span>
            <span class="min-w-0 w-full rounded-2xl border-2 border-[#2c8d98] bg-white px-4 py-3 font-black sm:flex-1">
              <span class="block text-xs">残り日数</span>
                  <span class="text-3xl leading-tight text-[#2c8d98]">{{ card.daysLeft }}日</span>
                </span>
               <span class="min-w-0 w-full rounded-2xl border-2 border-[#2c8d98] bg-white px-4 py-3 font-black sm:flex-1">
                  <span class="block text-xs">残り作業時間</span>
                  <span class="text-3xl leading-tight text-[#2c8d98]">{{ formatWorkDuration(card.remainingWork) }}</span>
                </span>
              </div>
            </article>
          </NuxtLink>
        </li>
      </ui>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Project } from "~/types/project";
import { getCrunchLevelClasses } from "~/utils/crunchLevelDisplay";
import { formatEventLabel, formatProjectDate } from "~/utils/projectDisplay";

const { projects, loadProjects } = useProjects();
const { settings, loadSettings } = useSettings();
const {
  calculateTotalProgress,
  calculateRemainingWork,
  calculateDaysLeft,
  calculateDailyWork,
  calculateCrunchLevel,
  formatWorkDuration,
} = useProgress();

const toProjectCard = (project: Project) => ({
  project,
  progress: calculateTotalProgress(project.pages, project.workProcessSteps),
  crunchLevel: calculateCrunchLevel(
    project.pages,
    project.deadline,
    project.startDate,
    project.workProcessSteps,
    settings.value.crunchThresholds
  ),
  dailyWork: calculateDailyWork(project.pages, project.deadline, project.workProcessSteps),
  daysLeft: calculateDaysLeft(project.deadline),
  remainingWork: calculateRemainingWork(project.pages, project.workProcessSteps),
});

const projectCards = computed(() => projects.value.map(toProjectCard));

onMounted(() => {
  loadSettings();
  loadProjects();
});
</script>
