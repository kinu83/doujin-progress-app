<template>
  <section
    class="mt-5 grid gap-2 border-t-2 border-dashed border-[#2c8d98]/40 pt-4"
    :aria-labelledby="`page-progress-title-${project.id}`"
  >
    <div class="flex items-center justify-between gap-3">
      <h4
        :id="`page-progress-title-${project.id}`"
        class="text-sm font-black text-[#263236]"
      >
        実績入力
      </h4>
      <span class="text-xs font-black text-[#263236]/50">
        未完了 {{ incompletePageCount }}P
      </span>
    </div>

    <label class="flex min-h-9 w-fit items-center gap-2 text-xs font-black text-[#263236]/60">
      <input
        v-model="showCompleted"
        type="checkbox"
        class="h-4 w-4 accent-[#2c8d98]"
      >
      完了済みのページも表示
    </label>

    <div class="grid max-h-96 gap-2 overflow-y-auto pr-1">
      <PageProgressSlider
        v-for="page in visiblePages"
        :key="page.pageNumber"
        :page="page"
        :work-process-steps="project.workProcessSteps"
        @change="emit('change', page.pageNumber, $event)"
      />

      <p
        v-if="visiblePages.length === 0"
        class="rounded-xl bg-[#edf6fa] px-3 py-2 text-center text-xs font-bold text-[#263236]/60"
      >
        すべてのページが完了しています。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PageStatus, Project } from "~~/types/project";
import { createStatusList } from "~/composables/useProgress";

const props = defineProps<{
  project: Project;
  dateKey: string;
}>();

const showCompleted = defineModel<boolean>("showCompleted");

const emit = defineEmits<{
  change: [pageNumber: number, status: PageStatus];
}>();

const isCompletedPage = (status: PageStatus) => {
  const statuses = createStatusList(props.project.workProcessSteps);

  return status === statuses[statuses.length - 1];
};

const incompletePageCount = computed(() => {
  return props.project.pages.filter((page) => !isCompletedPage(page.status)).length;
});

const visiblePages = computed(() => {
  if (showCompleted.value) return props.project.pages;

  // この日に進めたページは完了しても一覧から消さず、直前の操作を戻せるようにする。
  const touchedPageNumbers = new Set(
    props.project.workLogs
      .filter((log) => log.kind === "pageStatus" && log.workDate === props.dateKey)
      .map((log) => log.pageNumber)
  );

  return props.project.pages.filter((page) => {
    return !isCompletedPage(page.status) || touchedPageNumbers.has(page.pageNumber);
  });
});
</script>
