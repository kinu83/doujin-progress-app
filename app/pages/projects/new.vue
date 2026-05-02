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

          <div class="grid gap-5 md:grid-cols-2">
            <label class="grid gap-2">
              <span class="text-sm font-semibold text-gray-700">作業開始日</span>
              <input
                v-model="startDate"
                type="date"
                :max="deadline || undefined"
                class="rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
              >
            </label>

            <label class="grid gap-2">
              <span class="text-sm font-semibold text-gray-700">イベント日</span>
              <input
                v-model="eventDate"
                type="date"
                :min="deadline || undefined"
                class="rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
              >
            </label>
          </div>

          <label class="grid gap-2">
            <span class="text-sm font-semibold text-gray-700">締切</span>
            <input
              v-model="deadline"
              type="date"
              required
              :min="startDate || undefined"
              :max="eventDate || undefined"
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

          <p
            v-if="formError"
            class="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {{ formError }}
          </p>

          <button
            type="submit"
            :disabled="!canSubmit"
            class="mt-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
            :class="{ 'cursor-not-allowed bg-gray-300': !canSubmit }"
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
const startDate = ref("");
const eventDate = ref("");
const deadline = ref("");
const totalPages = ref(16);

const formError = computed(() => {
  if (startDate.value && deadline.value && startDate.value > deadline.value) {
    return "作業開始日は締切日以前の日付を設定してください。";
  }

  if (deadline.value && eventDate.value && deadline.value > eventDate.value) {
    return "原稿締切はイベント日以前の日付を設定してください。";
  }

  return "";
});

const canSubmit = computed(() => !formError.value);

onMounted(() => {
  loadProjects();
});

const handleSubmit = () => {
  if (!canSubmit.value) return;

  const project = createProject({
    title: title.value.trim(),
    startDate: startDate.value,
    eventDate: eventDate.value,
    deadline: deadline.value,
    totalPages: totalPages.value,
  });

  router.push(`/projects/${project.id}`);
};
</script>
