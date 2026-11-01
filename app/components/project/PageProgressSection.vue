<template>
  <section class="rounded-3xl border-4 border-[#2c8d98] bg-white p-8 shadow-[5px_5px_0_rgba(44,141,152,0.16)]">
    <h2 class="text-xl font-black text-[#263236]">
      ページ別進捗
    </h2>
    <p class="mt-1 text-sm font-black text-[#263236]/60">
      入力対象日: {{ workDateLabel }}
    </p>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <PageProgressSlider
        v-for="page in project.pages"
        :key="page.pageNumber"
        :page="page"
        :work-process-steps="project.workProcessSteps"
        @change="emit('change', page.pageNumber, $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PageStatus, Project } from "~~/types/project";
import { parseDateKey } from "~/utils/planAllocation";

const props = defineProps<{
  project: Project;
  workDateKey: string;
}>();

const emit = defineEmits<{
  change: [pageNumber: number, status: PageStatus];
}>();

const workDateLabel = computed(() => {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseDateKey(props.workDateKey));
});
</script>
