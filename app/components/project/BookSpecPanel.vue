<template>
  <div class="mt-4 text-sm font-bold text-[#263236]/70">
    <div
      v-if="isMemoOpen"
      class="rounded-2xl border-2 border-[#2c8d98]/30 bg-white px-4 py-3"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 font-black text-[#263236] transition hover:text-[#2c8d98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8d98] focus-visible:ring-offset-2"
          :aria-expanded="isBookSpecOpen"
          aria-label="本の情報を開閉"
          @click="isBookSpecOpen = !isBookSpecOpen"
        >
          <span
            class="text-xs transition-transform"
            :class="{ 'rotate-90': isBookSpecOpen }"
            aria-hidden="true"
          >
            ▶
          </span>
          <span>本の情報</span>
        </button>
        <button
          type="button"
          class="rounded-lg border-2 border-[#2c8d98] bg-white px-3 py-1 text-xs font-black text-[#2c8d98] shadow-[2px_2px_0_rgba(44,141,152,0.16)] transition hover:-translate-y-0.5 hover:bg-[#edf6fa]"
          @click="emit('edit')"
        >
          編集
        </button>
      </div>
      <dl
        v-if="isBookSpecOpen"
        class="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2"
      >
        <div
          v-for="item in bookSpecItems"
          :key="item.label"
          class="min-w-0 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3"
        >
          <dt class="text-xs font-black text-[#263236]/55">
            {{ item.label }}
          </dt>
          <dd class="whitespace-pre-wrap break-words text-sm font-black text-[#263236]">
            {{ item.value }}
          </dd>
        </div>
      </dl>
    </div>
    <button
      type="button"
      class="mx-auto mt-3 flex w-fit items-center px-3 py-1 text-sm leading-none text-[#2c8d98] transition hover:text-[#237984] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8d98] focus-visible:ring-offset-2"
      :aria-expanded="isMemoOpen"
      aria-label="メモ欄を開閉"
      @click="isMemoOpen = !isMemoOpen"
    >
      <span
        class="transition-transform"
        :class="{ 'rotate-180': isMemoOpen }"
        aria-hidden="true"
      >
        ▼
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Project } from "~/types/project";

const props = defineProps<{
  project: Project;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const isMemoOpen = ref(false);
const isBookSpecOpen = ref(false);

const formatBookSpecText = (value: string | number, unit = "") => {
  const text = typeof value === "number"
    ? value > 0 ? `${value.toLocaleString()}${unit}` : ""
    : value.trim();

  return {
    value: text,
    isEmpty: !text,
  };
};
const bookSpecItems = computed(() => {
  const { totalPages, workProcessName, bookSpec } = props.project;

  return [
    {
      label: "ページ数",
      value: `${totalPages.toLocaleString()}P`,
      isEmpty: false,
    },
    {
      label: "作業工程",
      ...formatBookSpecText(workProcessName),
    },
    {
      label: "カラー",
      ...formatBookSpecText(bookSpec.colorMode),
    },
    {
      label: "表紙の紙",
      ...formatBookSpecText(bookSpec.coverPaper),
    },
    {
      label: "本文の紙",
      ...formatBookSpecText(bookSpec.bodyPaper),
    },
    {
      label: "印刷会社",
      ...formatBookSpecText(bookSpec.printer),
    },
    {
      label: "発行部数",
      ...formatBookSpecText(bookSpec.printRun, "部"),
    },
    {
      label: "予算",
      ...formatBookSpecText(bookSpec.budget, "円"),
    },
    {
      label: "メモ",
      ...formatBookSpecText(bookSpec.note),
    },
  ].filter((item) => !item.isEmpty);
});
</script>
