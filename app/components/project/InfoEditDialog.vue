<template>
  <UiModal
    :open="open"
    overlay-class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#263236]/50 px-4 py-6"
    @close="emit('cancel')"
  >
    <form
      class="flex max-h-[calc(100dvh-3rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border-4 border-[#2c8d98] bg-white shadow-[5px_5px_0_rgba(44,141,152,0.18)]"
      @submit.prevent="handleSubmit"
    >
      <div class="shrink-0 border-b-2 border-dashed border-[#2c8d98] px-6 py-5">
        <h2 class="text-lg font-black text-[#263236]">
          プロジェクト情報を編集
        </h2>
        <p class="mt-1 text-sm font-bold text-[#263236]/60">
          作業開始日や締切など、進捗計算に使う情報を更新できます。
        </p>
      </div>

      <div class="grid gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
        <label class="grid gap-2 md:col-span-2">
          <span class="text-sm font-black text-[#263236]">タイトル</span>
          <input
            v-model="form.title"
            type="text"
            required
            class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
        </label>

        <label class="grid gap-2 md:col-span-2">
          <span class="text-sm font-black text-[#263236]">イベント名</span>
          <input
            v-model="form.eventName"
            type="text"
            class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
        </label>

        <label class="grid gap-2 md:col-span-2">
          <span class="text-sm font-black text-[#263236]">イベント開催日</span>
          <input
            v-model="form.eventDate"
            type="date"
            :min="eventDateMin"
            class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">作業開始日</span>
          <input
            v-model="form.startDate"
            type="date"
            :max="form.deadline"
            class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">締切日</span>
          <input
            v-model="form.deadline"
            type="date"
            required
            :min="deadlineMin"
            :max="form.eventDate || undefined"
            class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">ページ数</span>
          <UiNumberStepper
            v-model="form.totalPages"
            required
            increase-label="ページ数を増やす"
            decrease-label="ページ数を減らす"
          />
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">作業工程</span>
          <select
            v-model="form.workProcessId"
            class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
            <option
              v-for="process in workProcesses"
              :key="process.id"
              :value="process.id"
            >
              {{ process.name }}
            </option>
          </select>
        </label>

        <p
          v-if="error"
          class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 md:col-span-2"
        >
          {{ error }}
        </p>
      </div>

      <div class="shrink-0 flex flex-col-reverse gap-3 border-t-2 border-dashed border-[#2c8d98] px-6 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
          @click="emit('cancel')"
        >
          キャンセル
        </button>
        <button
          type="submit"
          :disabled="Boolean(error)"
          class="rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984] disabled:cursor-not-allowed disabled:border-[#d7d7d7] disabled:bg-[#d7d7d7]"
        >
          保存
        </button>
      </div>
    </form>
  </UiModal>
</template>

<script setup lang="ts">
import type { ProjectInfoInput } from "~/composables/useProjects";
import type { Project } from "~/types/project";
import type { WorkProcess } from "~/types/settings";
import { formatDateKey } from "~/utils/planAllocation";

const props = defineProps<{
  open: boolean;
  project: Project;
  workProcesses: WorkProcess[];
}>();

const emit = defineEmits<{
  save: [input: ProjectInfoInput];
  cancel: [];
}>();

const form = reactive<ProjectInfoInput>({
  eventName: "",
  title: "",
  startDate: "",
  eventDate: "",
  deadline: "",
  totalPages: 1,
  workProcessId: "",
});

// 編集中の入力を持ち越さないよう、開くたびに保存済みの値で初期化する。
watch(() => props.open, (isOpen) => {
  if (!isOpen) return;

  form.eventName = props.project.eventName;
  form.title = props.project.title;
  form.startDate = props.project.startDate;
  form.eventDate = props.project.eventDate;
  form.deadline = props.project.deadline;
  form.totalPages = props.project.totalPages;
  form.workProcessId = props.project.workProcessId;
});

const todayKey = computed(() => formatDateKey(new Date()));

// 締切を過ぎたプロジェクトも他の項目を編集できるよう、保存済みの過去日付はそのまま許可する。
const getMinEditableDate = (savedDate: string) => {
  return savedDate && savedDate < todayKey.value ? savedDate : todayKey.value;
};
const isPastEditDate = (value: string, savedDate: string) => {
  return Boolean(value) && value < getMinEditableDate(savedDate);
};
const laterDateKey = (a: string, b: string) => (a > b ? a : b);
const eventDateMin = computed(() => {
  return laterDateKey(getMinEditableDate(props.project.eventDate), form.deadline);
});
const deadlineMin = computed(() => {
  return laterDateKey(getMinEditableDate(props.project.deadline), form.startDate);
});

const error = computed(() => {
  if (isPastEditDate(form.eventDate, props.project.eventDate)) {
    return "イベント開催日は今日以降の日付を設定してください。";
  }

  if (isPastEditDate(form.deadline, props.project.deadline)) {
    return "締切日は今日以降の日付を設定してください。";
  }

  if (form.startDate && form.deadline && form.startDate > form.deadline) {
    return "作業開始日は締切日以前の日付を設定してください。";
  }

  if (form.deadline && form.eventDate && form.deadline > form.eventDate) {
    return "原稿締切はイベント日以前の日付を設定してください。";
  }

  return "";
});

const handleSubmit = () => {
  // HTML制約だけでなく、日付同士の関係もcomputedの結果で止める。
  if (error.value) return;

  emit("save", {
    ...form,
    eventName: form.eventName.trim(),
    title: form.title.trim(),
  });
};
</script>
