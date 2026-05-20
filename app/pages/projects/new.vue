<template>
  <main class="min-h-screen bg-[#edf6fa] px-6 py-8 text-[#263236]">
    <div class="mx-auto max-w-3xl">
      <NuxtLink
        to="/"
        class="inline-flex items-center rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)]"
      >
        ← 一覧に戻る
      </NuxtLink>

      <section class="mt-4 rounded-3xl border-4 border-[#2c8d98] bg-white p-6 shadow-[5px_5px_0_rgba(44,141,152,0.16)] sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-3 border-b-2 border-dashed border-[#2c8d98] pb-5">
          <div>
            <h1 class="text-3xl font-black text-[#263236]">
              新規プロジェクト作成
            </h1>
            <p class="mt-2 text-sm font-bold text-[#263236]/60">
              イベント情報、作品タイトル、作業期間を登録すると進捗管理を始められます。
            </p>
          </div>
          <span class="rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-3 py-1 text-xs font-black text-[#2c8d98]">
            初期ページ数 {{ settings.defaultTotalPages }}P
          </span>
        </div>

        <form class="mt-8 grid gap-5" @submit.prevent="handleSubmit">
          <label class="grid gap-2">
            <span class="text-sm font-black text-[#263236]">イベント名</span>
            <input
              v-model="eventName"
              type="text"
              placeholder="例: コミックマーケット"
              class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition placeholder:text-[#263236]/35 focus:border-[#2c8d98]"
            >
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-black text-[#263236]">イベント開催日</span>
            <input
              v-model="eventDate"
              type="date"
              :min="deadline || undefined"
              class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
            >
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-black text-[#263236]">タイトル</span>
            <input
              v-model="title"
              type="text"
              required
              placeholder="例: 2026夏コミ新刊"
              class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition placeholder:text-[#263236]/35 focus:border-[#2c8d98]"
            >
          </label>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="grid gap-2">
              <span class="text-sm font-black text-[#263236]">作業開始日</span>
              <input
                v-model="startDate"
                type="date"
                :max="deadline || undefined"
                class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
              >
            </label>

            <label class="grid gap-2">
              <span class="text-sm font-black text-[#263236]">締切日</span>
              <input
                v-model="deadline"
                type="date"
                required
                :min="startDate || undefined"
                :max="eventDate || undefined"
                class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
              >
            </label>
          </div>

          <section class="grid gap-5 border-t-2 border-dashed border-[#2c8d98] pt-6 md:grid-cols-2">
            <label class="grid gap-2">
              <span class="text-sm font-black text-[#263236]">総ページ数</span>
              <input
                v-model.number="totalPages"
                type="number"
                min="1"
                required
                class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
              >
            </label>

            <label class="grid gap-2">
              <span class="text-sm font-black text-[#263236]">作業工程</span>
              <select
                v-model="workProcessId"
                class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
              >
                <option
                  v-for="process in settings.workProcesses"
                  :key="process.id"
                  :value="process.id"
                >
                  {{ process.name }}
                </option>
              </select>
            </label>
          </section>

          <p
            v-if="formError"
            class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
          >
            {{ formError }}
          </p>

          <div class="mt-2 flex flex-wrap gap-3">
            <NuxtLink
              to="/"
              class="rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
            >
              キャンセル
            </NuxtLink>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984] disabled:cursor-not-allowed disabled:border-[#d7d7d7] disabled:bg-[#d7d7d7] disabled:shadow-none"
            >
              作成して詳細へ進む
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useProjects } from "~/composables/useProjects";

const router = useRouter();
const { createProject, loadProjects } = useProjects();
const { settings, loadSettings } = useSettings();

const eventName = ref("");
const title = ref("");
const startDate = ref("");
const eventDate = ref("");
const deadline = ref("");
const totalPages = ref(settings.value.defaultTotalPages);
const workProcessId = ref(settings.value.defaultWorkProcessId);

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
  loadSettings();
  loadProjects();
  totalPages.value = settings.value.defaultTotalPages;
  workProcessId.value = settings.value.defaultWorkProcessId;
});

const handleSubmit = () => {
  if (!canSubmit.value) return;

  const project = createProject({
    eventName: eventName.value.trim(),
    title: title.value.trim(),
    startDate: startDate.value,
    eventDate: eventDate.value,
    deadline: deadline.value,
    totalPages: totalPages.value,
    workProcessId: workProcessId.value,
  });

  router.push(`/projects/${project.id}`);
};
</script>
