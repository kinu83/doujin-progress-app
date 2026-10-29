<template>
  <button
    type="button"
    :aria-label="label"
    title="閉じる"
    class="grid shrink-0 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] transition hover:bg-[#f7fcfd]"
    :class="size === 'lg' ? 'h-11 w-11' : 'h-10 w-10'"
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  // 読み上げ用の説明（例: 作業時間入力を閉じる）
  label: string;
  size?: "md" | "lg";
}>(), {
  size: "md",
});
</script>
