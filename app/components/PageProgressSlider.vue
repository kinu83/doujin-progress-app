<template>
  <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]">
    <div class="flex items-center justify-between gap-3">
      <p class="font-black text-[#263236]">
        {{ page.pageNumber }}P
      </p>
      <span class="text-sm font-black text-[#263236]/70">
        {{ page.status }}・{{ calculatePageProgress(page, workProcessSteps) }}%
      </span>
    </div>

    <button
      type="button"
      class="group mt-3 w-full rounded-full py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8d98] focus-visible:ring-offset-2"
      role="slider"
      :aria-label="`${page.pageNumber}Pの進捗ステップ`"
      :aria-valuemin="0"
      :aria-valuemax="statuses.length - 1"
      :aria-valuenow="statusIndex"
      :aria-valuetext="page.status"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <div class="relative h-3 overflow-hidden rounded-full bg-[#d7d7d7] shadow-inner">
        <div
          class="h-full rounded-full bg-[#2c8d98] transition-[width]"
          :style="{ width: `${getStatusIndexPercent(statusIndex)}%` }"
        />
      </div>
      <div
        class="relative mt-1 h-3"
        aria-hidden="true"
      >
        <span
          v-for="(status, index) in statuses"
          :key="status"
          class="absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 bg-white transition group-hover:border-[#2c8d98]"
          :class="index <= statusIndex ? 'border-[#2c8d98]' : 'border-[#d7d7d7]'"
          :style="{ left: `${getStatusIndexPercent(index)}%` }"
        />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { calculatePageProgress, createStatusList } from "~/composables/useProgress";
import type { ManuscriptPage, PageStatus } from "~/types/project";
import type { WorkProcessStep } from "~/types/settings";

const props = defineProps<{
  page: ManuscriptPage;
  workProcessSteps: WorkProcessStep[];
}>();

const emit = defineEmits<{
  change: [status: PageStatus];
}>();

// ページ進捗の入力候補は、プロジェクトに保存された工程定義から作る。
const statuses = computed<PageStatus[]>(() => createStatusList(props.workProcessSteps));
const statusIndex = computed(() => Math.max(0, statuses.value.indexOf(props.page.status)));

const getStatusIndexPercent = (index: number) => {
  if (statuses.value.length <= 1) return 0;

  return Math.round((index / (statuses.value.length - 1)) * 100);
};

const emitStatus = (status: PageStatus | undefined) => {
  if (!status || status === props.page.status) return;

  emit("change", status);
};

const handleClick = (event: MouseEvent) => {
  // キーボード操作から発火したclickはkeydown側で処理済みなので重複更新を避ける。
  if (event.detail === 0) return;

  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  const pointerX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  const ratio = rect.width === 0 ? 0 : pointerX / rect.width;
  // クリック位置を最も近い工程へ丸めることで、バー全体をステップ入力として使う。
  emitStatus(statuses.value[Math.round(ratio * (statuses.value.length - 1))]);
};

const handleKeydown = (event: KeyboardEvent) => {
  const currentIndex = statusIndex.value;
  const keyToStatusIndex: Record<string, number> = {
    ArrowLeft: currentIndex - 1,
    ArrowDown: currentIndex - 1,
    ArrowRight: currentIndex + 1,
    ArrowUp: currentIndex + 1,
    Home: 0,
    End: statuses.value.length - 1,
  };
  const nextIndex = keyToStatusIndex[event.key];

  if (nextIndex === undefined) return;

  event.preventDefault();
  // キーボード操作でもスライダーの範囲外へ出ないように丸める。
  emitStatus(statuses.value[Math.min(Math.max(nextIndex, 0), statuses.value.length - 1)]);
};
</script>
