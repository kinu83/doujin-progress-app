<template>
  <div class="grid gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <div class="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <h1 class="break-words text-3xl font-black text-[#263236]">
            {{ project.title }}
          </h1>
          <span
            v-if="formatEventLabel(project)"
            class="rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-3 py-1 text-xs font-black text-[#2c8d98]"
          >
            {{ formatEventLabel(project) }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap justify-end gap-2">
        <button
          type="button"
          class="rounded-xl border-2 border-red-500 bg-white px-4 py-2 text-sm font-black text-red-700 shadow-[3px_3px_0_rgba(220,38,38,0.16)] transition hover:-translate-y-0.5 hover:bg-red-50"
          @click="emit('delete')"
        >
          削除
        </button>
        <button
          type="button"
          class="rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
          @click="emit('edit')"
        >
          情報を編集
        </button>
      </div>
    </div>

    <div class="grid gap-1 border-b-2 border-dashed border-[#2c8d98] pb-3 text-sm font-black text-[#263236] sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
      <span class="flex flex-wrap gap-x-2">
        <span class="text-xs text-[#263236]/60">入稿締切日</span>
        <span>{{ formatProjectDate(project.deadline) }}</span>
      </span>
      <span v-if="project.startDate" class="flex flex-wrap gap-x-2 sm:border-l-2 sm:border-[#2c8d98]/50 sm:pl-4">
        <span class="text-xs text-[#263236]/60">作業開始日</span>
        <span>{{ formatProjectDate(project.startDate) }}</span>
      </span>
      <span v-else class="text-[#263236]/50">
        作業開始日は未設定です
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from "~~/types/project";
import { formatEventLabel, formatProjectDate } from "~/utils/projectDisplay";

defineProps<{
  project: Project;
}>();

const emit = defineEmits<{
  delete: [];
  edit: [];
}>();
</script>
