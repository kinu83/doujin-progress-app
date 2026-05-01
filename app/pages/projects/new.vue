<template>
  <main class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-2xl">
      <NuxtLink to="/" class="text-sm font-semibold text-gray-500">
        ← 一覧に戻る
      </NuxtLink>

      <div class="mt-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">
          新規プロジェクト作成
        </h1>
        <p class="mt-2 text-sm text-gray-500">
          タイトル、締切、ページ数を登録すると進捗管理を始められます。
        </p>

        <form class="mt-8 grid gap-5" @submit.prevent="handleSubmit">
          <label class="grid gap-2">
            <span class="text-sm font-semibold text-gray-700">タイトル</span>
            <input
              v-model="title"
              type="text"
              required
              placeholder="例: 2026夏コミ新刊"
              class="rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
            >
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-semibold text-gray-700">締切</span>
            <input
              v-model="deadline"
              type="date"
              required
              class="rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
            >
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-semibold text-gray-700">総ページ数</span>
            <input
              v-model.number="totalPages"
              type="number"
              min="1"
              required
              class="rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
            >
          </label>

          <button
            type="submit"
            class="mt-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
          >
            作成して詳細へ進む
          </button>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useProjects } from "~/composables/useProjects";

const router = useRouter();
const { createProject, loadProjects } = useProjects();

const title = ref("");
const deadline = ref("");
const totalPages = ref(16);

onMounted(() => {
  loadProjects();
});

const handleSubmit = () => {
  const project = createProject(
    title.value.trim(),
    deadline.value,
    totalPages.value,
  );

  router.push(`/projects/${project.id}`);
};
</script>
