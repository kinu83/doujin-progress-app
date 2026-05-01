<template>
  <main class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-5xl">
      <NuxtLink to="/" class="text-sm font-semibold text-gray-500">
        ← 一覧に戻る
      </NuxtLink>

      <div v-if="project" class="mt-4 grid gap-6">
        <section class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ project.title }}
              </h1>
              <p class="mt-2 text-sm text-gray-500">
                締切 {{ project.deadline }} / {{ project.totalPages }}P
              </p>
            </div>

            <div class="text-right">
              <p class="text-3xl font-bold text-gray-900">
                {{ calculateTotalProgress(project.pages) }}%
              </p>
              <p class="text-sm text-gray-500">
                全体進捗
              </p>
            </div>
          </div>

          <div class="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              class="h-full rounded-full bg-gray-900"
              :style="{ width: `${calculateTotalProgress(project.pages)}%` }"
            />
          </div>

          <div class="mt-5 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
            <div class="rounded-2xl bg-gray-50 p-4">
              残り日数: {{ calculateDaysLeft(project.deadline) }}日
            </div>
            <div class="rounded-2xl bg-gray-50 p-4">
              残作業量: {{ calculateRemainingWork(project.pages) }}
            </div>
            <div class="rounded-2xl bg-gray-50 p-4">
              1日あたり必要量: {{ calculateDailyWork(project.pages, project.deadline) }}
            </div>
          </div>
        </section>

        <section class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h2 class="text-lg font-bold text-gray-900">
            ページ別進捗
          </h2>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div
              v-for="page in project.pages"
              :key="page.pageNumber"
              class="rounded-2xl border border-gray-200 p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="font-semibold text-gray-900">
                  {{ page.pageNumber }}P
                </p>
                <span class="text-sm font-semibold text-gray-600">
                  {{ page.progress }}%
                </span>
              </div>

              <div class="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  class="h-full rounded-full bg-gray-900"
                  :style="{ width: `${page.progress}%` }"
                />
              </div>

              <select
                :value="page.status"
                class="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                @change="handleStatusChange(page.pageNumber, $event)"
              >
                <option
                  v-for="status in statuses"
                  :key="status"
                  :value="status"
                >
                  {{ status }}
                </option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <p class="text-lg font-semibold text-gray-900">
          プロジェクトが見つかりません
        </p>
        <p class="mt-2 text-sm text-gray-500">
          一覧から作成し直してください。
        </p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useProgress } from "~/composables/useProgress";
import { useProjects } from "~/composables/useProjects";
import type { PageStatus } from "~/types/project";

const route = useRoute();
const { getProjectById, loadProjects, updatePageStatus } = useProjects();
const {
  calculateTotalProgress,
  calculateRemainingWork,
  calculateDaysLeft,
  calculateDailyWork,
} = useProgress();

const statuses: PageStatus[] = [
  "未着手",
  "ネーム",
  "下描き",
  "ペン入れ",
  "仕上げ",
  "完成",
];

onMounted(() => {
  loadProjects();
});

const project = computed(() => getProjectById(String(route.params.id)));

const handleStatusChange = (pageNumber: number, event: Event) => {
  const nextStatus = (event.target as HTMLSelectElement).value as PageStatus;
  updatePageStatus(String(route.params.id), pageNumber, nextStatus);
};
</script>
