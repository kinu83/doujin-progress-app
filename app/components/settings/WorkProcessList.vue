<template>
  <div class="grid gap-3">
    <article
      v-for="process in processes"
      :key="process.id"
      class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h4 class="font-black text-[#263236]">
              {{ process.name }}
            </h4>
            <span
              v-if="defaultProcessId === process.id"
              class="rounded-full border-2 border-[#263236] bg-[#2c8d98] px-2 py-1 text-xs font-black text-white"
            >
              既定
            </span>
          </div>
          <p class="mt-2 text-sm font-bold text-[#263236]/60">
            未着手 → {{ formatWorkProcessSteps(process.steps) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-xs font-black text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
            @click="emit('edit', process)"
          >
            編集
          </button>
          <button
            type="button"
            class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-xs font-black text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
            @click="emit('setDefault', process.id)"
          >
            既定にする
          </button>
          <button
            type="button"
            class="rounded-xl border-2 border-red-500 bg-white px-3 py-2 text-xs font-black text-red-700 shadow-[2px_2px_0_rgba(220,38,38,0.16)] transition hover:-translate-y-0.5 hover:bg-red-50"
            :disabled="processes.length <= 1"
            :class="{ 'cursor-not-allowed opacity-40': processes.length <= 1 }"
            @click="emit('delete', process.id)"
          >
            削除
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { WorkProcess, WorkProcessStep } from "~/types/settings";

defineProps<{
  processes: WorkProcess[];
  defaultProcessId: string;
}>();

const emit = defineEmits<{
  edit: [process: WorkProcess];
  setDefault: [processId: string];
  delete: [processId: string];
}>();

const formatWorkProcessSteps = (steps: WorkProcessStep[]) => {
  return steps
    .map((step) => `${step.name}（${step.minutesPerPage}分）`)
    .join(" → ");
};
</script>
