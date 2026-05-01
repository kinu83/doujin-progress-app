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

        <NuxtLink
          to="/projects/new"
          class="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white"
        >
          新規作成
        </NuxtLink>
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
            </div>

            <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
              {{ calculateTotalProgress(project.pages) }}%
            </span>
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
            <span>今日の必要量: {{ calculateDailyWork(project.pages, project.deadline) }}</span>
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
  calculateDailyWork,
} = useProgress();

onMounted(() => {
  loadProjects();
});
</script>
