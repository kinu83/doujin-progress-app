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
        <NuxtLink
          v-for="project in projects"
          :key="project.id"
          :to="`/projects/${project.id}`"
          class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-gray-900">
                {{ project.title }}
              </h2>
              <p class="mt-1 text-sm text-gray-500">
                締切: {{ project.deadline }} / {{ project.totalPages }}P
              </p>
              <p v-if="project.startDate" class="mt-1 text-sm text-gray-500">
                作業開始日: {{ project.startDate }}
              </p>
              <p v-if="project.eventDate" class="mt-1 text-sm text-gray-500">
                イベント日: {{ project.eventDate }}
              </p>
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
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">

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
