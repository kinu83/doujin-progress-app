<template>
  <UiModal
    :open="open"
    overlay-class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#263236]/50 px-4 py-6"
    @close="emit('cancel')"
  >
    <form
      class="flex max-h-[calc(100dvh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-4 border-[#2c8d98] bg-white shadow-[5px_5px_0_rgba(44,141,152,0.18)]"
      @submit.prevent="emit('save', { ...form })"
    >
      <div class="shrink-0 border-b-2 border-dashed border-[#2c8d98] px-6 py-5">
        <h2 class="text-lg font-black text-[#263236]">
          本の情報を編集
        </h2>
        <p class="mt-1 text-sm font-bold text-[#263236]/60">
          ページ数や印刷仕様を更新できます。
        </p>
      </div>

      <div class="grid gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
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
          <span class="text-sm font-black text-[#263236]">カラー</span>
          <select
            v-model="form.colorMode"
            class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
            <option
              v-for="colorMode in colorModes"
              :key="colorMode"
              :value="colorMode"
            >
              {{ colorMode }}
            </option>
          </select>
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">表紙の紙</span>
          <input
            v-model="form.coverPaper"
            type="text"
            class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">本文の紙</span>
          <input
            v-model="form.bodyPaper"
            type="text"
            class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">印刷会社</span>
          <input
            v-model="form.printer"
            type="text"
            class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
          >
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">発行部数</span>
          <UiNumberStepper
            v-model="form.printRun"
            :step="10"
            :min="0"
            increase-label="発行部数を10部増やす"
            decrease-label="発行部数を10部減らす"
          />
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-black text-[#263236]">予算</span>
          <UiNumberStepper
            v-model="form.budget"
            :step="1000"
            :min="0"
            increase-label="予算を1000円増やす"
            decrease-label="予算を1000円減らす"
          />
        </label>

        <label class="grid gap-2 md:col-span-2">
          <span class="text-sm font-black text-[#263236]">メモ</span>
          <textarea
            v-model="form.note"
            rows="5"
            class="resize-y rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold leading-6 text-[#263236] outline-none transition focus:border-[#2c8d98]"
          />
        </label>
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
          class="rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984]"
        >
          保存
        </button>
      </div>
    </form>
  </UiModal>
</template>

<script setup lang="ts">
import type { BookSpecInput } from "~/composables/useProjects";
import type { PrintColorMode, Project } from "~/types/project";

const props = defineProps<{
  open: boolean;
  project: Project;
}>();

const emit = defineEmits<{
  save: [input: BookSpecInput];
  cancel: [];
}>();

const colorModes: PrintColorMode[] = ["フルカラー", "モノクロ"];

const form = reactive<BookSpecInput>({
  totalPages: 1,
  colorMode: "モノクロ",
  coverPaper: "",
  bodyPaper: "",
  printer: "",
  printRun: 0,
  budget: 0,
  note: "",
});

// 編集中の入力を持ち越さないよう、開くたびに保存済みの値で初期化する。
watch(() => props.open, (isOpen) => {
  if (!isOpen) return;

  form.totalPages = props.project.totalPages;
  form.colorMode = props.project.bookSpec.colorMode;
  form.coverPaper = props.project.bookSpec.coverPaper;
  form.bodyPaper = props.project.bookSpec.bodyPaper;
  form.printer = props.project.bookSpec.printer;
  form.printRun = props.project.bookSpec.printRun;
  form.budget = props.project.bookSpec.budget;
  form.note = props.project.bookSpec.note;
});
</script>
