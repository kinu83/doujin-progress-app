<template>
  <main class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            同人原稿進捗管理
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            締切から逆算して、今日必要な作業量を確認できます。
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/calendar"
            aria-label="カレンダーを表示"
            title="カレンダー"
            class="grid h-10 w-10 place-items-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-100"
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
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="3" />
              <path d="M3 10h18" />
            </svg>
          </NuxtLink>

          <NuxtLink
            to="/projects/new"
            class="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white"
          >
            新規作成
          </NuxtLink>
        </div>
      </div>

      <div
        v-if="projects.length === 0"
        class="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center"
      >
        <p class="text-base font-semibold text-gray-800">
          まだプロジェクトがありません
        </p>
        <p class="mt-2 text-sm text-gray-500">
          まずは 1 件作成して、1 日あたりの必要作業量を確認しましょう。
        </p>
      </div>

      <div v-else class="grid gap-4">
        <article
          v-for="project in projects"
          :key="project.id"
          class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-2 font-bold">
                <NuxtLink
                  :to="`/projects/${project.id}`"
                  class="text-lg text-gray-900 transition hover:text-gray-600"
                >
                  {{ project.title }}
                </NuxtLink>
                <span
                  v-if="formatEventLabel(project)"
                  class="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-100"
                >
                  {{ formatEventLabel(project) }}
                </span>
              </div>
              <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <span>
                  締切日 {{ formatProjectDate(project.deadline) }}
                </span>
                <span v-if="project.startDate">
                  作業開始日 {{ formatProjectDate(project.startDate) }}
                </span>
              </div>
              <details class="group mt-1 text-sm text-gray-500">
                <summary class="flex cursor-pointer list-none items-center gap-1 font-semibold text-gray-500 hover:text-gray-700">
                  <span class="text-[10px] transition-transform group-open:rotate-90">
                    ▶
                  </span>
                  <span>本の情報</span>
                </summary>

                <div class="mt-1">
                  <dl class="flex flex-wrap gap-x-4 gap-y-1">
                    <div class="flex gap-1">
                      <dt>ページ数</dt>
                      <dd>{{ project.totalPages }}P</dd>
                    </div>
                    <div class="flex gap-1">
                      <dt>カラー</dt>
                      <dd>{{ project.bookSpec.colorMode }}</dd>
                    </div>
                    <div v-if="project.bookSpec.coverPaper" class="flex gap-1">
                      <dt>表紙の紙</dt>
                      <dd>{{ project.bookSpec.coverPaper }}</dd>
                    </div>
                    <div v-if="project.bookSpec.bodyPaper" class="flex gap-1">
                      <dt>本文の紙</dt>
                      <dd>{{ project.bookSpec.bodyPaper }}</dd>
                    </div>
                    <div v-if="project.bookSpec.printer" class="flex gap-1">
                      <dt>印刷会社</dt>
                      <dd>{{ project.bookSpec.printer }}</dd>
                    </div>
                    <div v-if="project.bookSpec.printRun" class="flex gap-1">
                      <dt>発行部数</dt>
                      <dd>{{ project.bookSpec.printRun }}部</dd>
                    </div>
                    <div v-if="project.bookSpec.budget" class="flex gap-1">
                      <dt>予算</dt>
                      <dd>{{ project.bookSpec.budget.toLocaleString() }}円</dd>
                    </div>
                  </dl>
                </div>
              </details>
            </div>

            <div class="flex shrink-0 flex-col items-end gap-2">
              <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {{ calculateTotalProgress(project.pages) }}%
              </span>
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="getCrunchLevelClasses(calculateCrunchLevel(project.pages, project.deadline, project.startDate).tone)"
              >
                修羅場レベル: {{ calculateCrunchLevel(project.pages, project.deadline, project.startDate).label }}
              </span>
            </div>
          </div>

          <div class="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              class="h-full rounded-full bg-gray-900"
              :style="{ width: `${calculateTotalProgress(project.pages)}%` }"
            />
          </div>

          <div class="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
            <span>残作業量: {{ calculateRemainingWork(project.pages) }}</span>
            <span>残り日数: {{ calculateDaysLeft(project.deadline) }}日</span>
            <span v-if="!isBeforeStartDate(project.startDate)">
              今日の必要量: {{ calculateDailyWork(project.pages, project.deadline) }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { formatEventLabel, formatProjectDate } from "~/utils/projectDisplay";

const { projects, loadProjects } = useProjects();
const {
  calculateTotalProgress,
  calculateRemainingWork,
  calculateDaysLeft,
  isBeforeStartDate,
  calculateDailyWork,
  calculateCrunchLevel,
} = useProgress();

const getCrunchLevelClasses = (tone: string) => {
  const classes: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  };

  return classes[tone] ?? classes.sky;
};

onMounted(() => {
  loadProjects();
});
</script>
