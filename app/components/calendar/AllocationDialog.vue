<template>
  <!-- ページ側の v-if で開閉する。閉じるたびに破棄されるので、確認中の状態も一緒に戻る。 -->
  <UiModal
    open
    overlay-class="fixed inset-0 z-50 grid place-items-center bg-[#263236]/30 px-4"
    @close="emit('close')"
  >
    <div
      class="grid max-h-[90vh] w-full max-w-sm gap-3 overflow-y-auto rounded-2xl border-4 border-[#2c8d98] bg-white p-5 shadow-[5px_5px_0_rgba(44,141,152,0.16)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="allocation-dialog-title"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 id="allocation-dialog-title" class="text-base font-black text-[#263236]">
            自動で割り振る
          </h2>
          <p class="mt-1 text-xs font-black text-[#263236]/60">
            {{ projectTitle }}
          </p>
        </div>
        <UiCloseButton
          label="自動割り振りを閉じる"
          size="lg"
          data-autofocus
          @click="emit('close')"
        />
      </div>

      <p class="text-xs font-bold text-[#263236]/60">
        今日から締切までの残り作業を、日ごとに均等に割り振ります。
      </p>

      <label class="grid gap-1 text-xs font-black text-[#263236]/60">
        土日の重み
        <select
          v-model.number="weekendWeight"
          class="min-h-11 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-3 text-sm font-bold text-[#263236] outline-none focus:border-[#2c8d98]"
          @change="isConfirming = false"
        >
          <option
            v-for="weight in weekendWeights"
            :key="weight"
            :value="weight"
          >
            ×{{ weight }}
          </option>
        </select>
      </label>

      <fieldset class="grid gap-1">
        <legend class="text-xs font-black text-[#263236]/60">
          作業しない曜日
        </legend>
        <div class="grid grid-cols-7 gap-1">
          <label
            v-for="(weekday, index) in WEEKDAY_LABELS"
            :key="weekday"
            class="flex min-h-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-xs font-black transition"
            :class="restDays.includes(index)
              ? 'border-[#263236]/40 bg-[#263236]/10 text-[#263236]/60'
              : 'border-[#2c8d98]/40 bg-white text-[#263236]'"
          >
            <input
              v-model="restDays"
              type="checkbox"
              :value="index"
              class="h-3.5 w-3.5 accent-[#263236]"
              @change="isConfirming = false"
            >
            {{ weekday }}
          </label>
        </div>
      </fieldset>

      <p
        v-if="plan.blockReason"
        class="rounded-xl bg-[#edf6fa] px-3 py-2 text-xs font-bold text-[#263236]/60"
      >
        {{ plan.blockReason }}
      </p>

      <template v-else>
        <div
          v-if="isConfirming"
          class="grid gap-2 rounded-xl border-2 border-[#f36b00]/40 bg-[#fff2e3] p-3 text-xs font-bold text-[#263236]"
          role="alert"
        >
          <p>
            {{ formatAllocationRange(plan) }} の {{ plan.workDayCount }}日<span v-if="plan.restDayCount">（休み {{ plan.restDayCount }}日）</span>に
            {{ formatWorkDuration(plan.totalMinutes) }} を割り振ります。
          </p>
          <p v-if="plan.weekdayRange">
            平日 {{ formatMinutesRange(plan.weekdayRange, formatWorkDuration) }}
          </p>
          <p v-if="plan.weekendRange">
            土日 {{ formatMinutesRange(plan.weekendRange, formatWorkDuration) }}
          </p>
          <p
            v-if="plan.overwriteCount"
            class="font-black text-[#f36b00]"
          >
            既存の予定 {{ plan.overwriteCount }}日分は上書きされます。
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="min-h-11 flex-1 rounded-xl border-2 border-[#f36b00] bg-[#f36b00] px-3 text-xs font-black text-white transition hover:bg-[#e06200]"
              @click="emit('confirm')"
            >
              {{ plan.overwriteCount ? '上書きする' : '割り振る' }}
            </button>
            <button
              type="button"
              class="min-h-11 flex-1 rounded-xl border-2 border-[#263236]/30 bg-white px-3 text-xs font-black text-[#263236] transition hover:bg-[#f7fcfd]"
              @click="isConfirming = false"
            >
              やめる
            </button>
          </div>
        </div>

        <button
          v-else
          type="button"
          class="min-h-11 rounded-xl border-2 border-[#2c8d98] bg-[#2c8d98] px-3 text-sm font-black text-white transition hover:bg-[#247a84]"
          @click="isConfirming = true"
        >
          割り振る
        </button>
      </template>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { WEEKDAY_LABELS } from "~/constants/calendar";
import { useProgress } from "~/composables/useProgress";
import {
  formatAllocationRange,
  formatMinutesRange,
  type AllocationOptions,
  type AllocationPlan,
} from "~/utils/planAllocation";

defineProps<{
  projectTitle: string;
  plan: AllocationPlan;
}>();

const options = defineModel<AllocationOptions>("options", { required: true });

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const weekendWeights = [1, 1.5, 2];

const { formatWorkDuration } = useProgress();

const isConfirming = ref(false);

const weekendWeight = computed({
  get: () => options.value.weekendWeight,
  set: (weekendWeight) => {
    options.value = { ...options.value, weekendWeight };
  },
});

const restDays = computed({
  get: () => options.value.restDays,
  set: (restDays) => {
    options.value = { ...options.value, restDays };
  },
});
</script>
