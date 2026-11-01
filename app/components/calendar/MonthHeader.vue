<template>
  <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dashed border-[#2c8d98] px-5 py-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center overflow-hidden rounded-xl border-2 border-[#263236] bg-white shadow-[3px_3px_0_rgba(38,50,54,0.14)]">
        <button
          type="button"
          aria-label="前の月"
          title="前の月"
          class="grid h-10 w-10 place-items-center text-[#263236] transition hover:bg-[#edf6fa]"
          @click="emit('move', -1)"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 class="min-w-36 border-x-2 border-[#263236]/20 px-4 text-center text-xl font-black text-[#263236]">
          {{ title }}
        </h2>
        <button
          type="button"
          aria-label="次の月"
          title="次の月"
          class="grid h-10 w-10 place-items-center text-[#263236] transition hover:bg-[#edf6fa]"
          @click="emit('move', 1)"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
      <button
        type="button"
        class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.14)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
        @click="emit('today')"
      >
        今日
      </button>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
      <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
        <span class="h-2 w-8 rounded-full bg-[#2c8d98]" />
        実績
      </div>
      <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
        <span class="h-2 w-8 rounded-full border-2 border-[#2c8d98]/50 bg-white" />
        予定
      </div>
      <div class="flex items-center gap-2 text-xs font-black text-[#263236]/60">
        <span class="h-2 w-8 rounded-full bg-[#f36b00]" />
        予定超過
      </div>
      <p class="text-sm font-black" :aria-label="`今月の実績 ${formatWorkDuration(totals.actual)}、予定 ${formatWorkDuration(totals.planned)}`">
        <span :class="totals.actual > totals.planned ? 'text-[#f36b00]' : 'text-[#2c8d98]'">
          実績 {{ formatWorkDuration(totals.actual) }}
        </span>
        <span class="text-[#263236]/40">
          / 予定 {{ formatWorkDuration(totals.planned) }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProgress } from "~/composables/useProgress";
import type { WorkTotals } from "~/utils/workBars";

defineProps<{
  title: string;
  totals: WorkTotals;
}>();

const emit = defineEmits<{
  move: [amount: number];
  today: [];
}>();

const { formatWorkDuration } = useProgress();
</script>
