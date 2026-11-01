<template>
  <UiModal
    :open="open"
    overlay-class="fixed inset-0 z-40 bg-[#263236]/20 backdrop-blur-[1px]"
    @close="emit('close')"
  >
    <aside
      class="ml-auto flex h-full min-h-0 w-full max-w-[420px] flex-col border-l-4 border-[#2c8d98] bg-white shadow-[-8px_0_0_rgba(44,141,152,0.16)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-panel-title"
    >
      <div class="flex items-start justify-between gap-4 border-b-2 border-dashed border-[#2c8d98] px-5 py-5">
        <div>
          <p class="text-sm font-black text-[#f36b00]">
            {{ dateLabel }}
          </p>
          <h2 id="work-panel-title" class="mt-1 text-lg font-black text-[#263236]">
            作業時間
          </h2>
        </div>
        <UiCloseButton
          label="作業時間入力を閉じる"
          data-autofocus
          class="shadow-[3px_3px_0_rgba(38,50,54,0.14)] hover:-translate-y-0.5"
          @click="emit('close')"
        />
      </div>

      <div class="grid min-h-0 flex-1 auto-rows-max content-start gap-5 overflow-y-auto px-5 py-5">
        <section v-if="schedule.length" class="grid gap-2">
          <h3 class="text-sm font-black text-[#263236]/60">
            予定日
          </h3>
          <div class="grid gap-2">
            <NuxtLink
              v-for="item in schedule"
              :key="`${item.projectId}-${item.kind}`"
              :to="`/projects/${item.projectId}`"
              class="rounded-2xl border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_rgba(38,50,54,0.12)]"
              :class="scheduleClasses[item.kind]"
            >
              {{ scheduleLabels[item.kind] }} {{ item.title }}
            </NuxtLink>
          </div>
        </section>

        <section class="grid auto-rows-max content-start gap-3">
          <h3 class="text-sm font-black text-[#263236]/60">
            {{ sectionTitle }}
          </h3>

          <div
            v-if="!hasProjects"
            class="rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-5 text-center text-sm font-bold text-[#263236]/60"
          >
            プロジェクトを作成すると、日別予定を入力できます。
          </div>

          <div
            v-else-if="!hasEditableProjects"
            class="rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-5 text-center text-sm font-bold text-[#263236]/60"
          >
            この日は作業期間内のプロジェクトがありません。
          </div>

          <slot />
        </section>
      </div>
    </aside>
  </UiModal>
</template>

<script setup lang="ts">
import { parseDateKey } from "~/utils/planAllocation";
import {
  scheduleClasses,
  scheduleLabels,
  type DateMode,
  type ScheduleItem,
} from "~/utils/calendarSchedule";

const props = defineProps<{
  open: boolean;
  dateKey: string;
  dateMode: DateMode;
  schedule: ScheduleItem[];
  hasProjects: boolean;
  hasEditableProjects: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const sectionTitles: Record<DateMode, string> = {
  past: "プロジェクト別実績",
  today: "プロジェクト別予定・実績",
  future: "プロジェクト別予定",
};

const dateLabel = computed(() => {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseDateKey(props.dateKey));
});

const sectionTitle = computed(() => sectionTitles[props.dateMode]);
</script>
