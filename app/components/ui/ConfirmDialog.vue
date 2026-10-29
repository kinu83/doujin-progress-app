<template>
  <UiModal
    :open="open"
    @close="emit('cancel')"
  >
    <section
      class="w-full max-w-md overflow-hidden rounded-3xl border-4 bg-white"
      :class="toneClasses.panel"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="border-b-2 px-6 py-5"
        :class="toneClasses.header"
      >
        <p
          class="text-sm font-black"
          :class="toneClasses.eyebrow"
        >
          {{ eyebrow }}
        </p>
        <h2 class="mt-1 text-lg font-black text-[#263236]">
          {{ title }}
        </h2>
      </div>

      <div class="px-6 py-5">
        <slot />
      </div>

      <div
        class="flex flex-col-reverse gap-3 border-t-2 px-6 py-4 sm:flex-row sm:justify-end"
        :class="toneClasses.footer"
      >
        <button
          type="button"
          data-autofocus
          class="rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
          @click="emit('cancel')"
        >
          キャンセル
        </button>
        <button
          type="button"
          :disabled="confirmDisabled"
          class="rounded-xl border-2 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
          :class="toneClasses.confirm"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </section>
  </UiModal>
</template>

<script setup lang="ts">
type ConfirmTone = "danger" | "warning";

const props = withDefaults(defineProps<{
  open: boolean;
  tone?: ConfirmTone;
  // タイトルの上に出す小見出し（例: 削除前の確認）
  eyebrow: string;
  title: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
}>(), {
  tone: "danger",
  confirmDisabled: false,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

// Tailwindが検出できるよう、クラス名は省略せずに書く。
const TONE_CLASSES: Record<ConfirmTone, Record<"panel" | "header" | "eyebrow" | "footer" | "confirm", string>> = {
  danger: {
    panel: "border-red-500 shadow-[5px_5px_0_rgba(220,38,38,0.18)]",
    header: "border-red-500 bg-red-50",
    eyebrow: "text-red-700",
    footer: "border-red-100",
    confirm: "border-red-700 bg-red-600 shadow-[3px_3px_0_rgba(220,38,38,0.28)] hover:bg-red-700",
  },
  warning: {
    panel: "border-amber-500 shadow-[5px_5px_0_rgba(245,158,11,0.18)]",
    header: "border-amber-500 bg-amber-50",
    eyebrow: "text-amber-700",
    footer: "border-amber-100",
    confirm: "border-amber-700 bg-amber-600 shadow-[3px_3px_0_rgba(245,158,11,0.28)] hover:bg-amber-700",
  },
};

const toneClasses = computed(() => TONE_CLASSES[props.tone]);
</script>
