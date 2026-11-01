<template>
  <ul
    class="flex flex-wrap gap-x-4 gap-y-1 border-b-2 border-dashed border-[#2c8d98]/40 px-5 py-2"
    aria-label="プロジェクトの色"
  >
    <li
      v-for="project in projects"
      :key="project.id"
      class="flex min-w-0 items-center gap-1.5 text-xs font-black text-[#263236]/70"
    >
      <span
        class="h-2.5 w-2.5 shrink-0 rounded-full"
        :style="{ backgroundColor: colors[project.id] }"
      />
      <span class="truncate">{{ project.title }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Project } from "~~/types/project";

defineProps<{
  projects: Project[];
  colors: Record<string, string>;
}>();
</script>
