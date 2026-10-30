<template>
  <div class="rounded-2xl border-2 border-[#2c8d98] bg-[#edf6fa] p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h4 class="font-black text-[#263236]">
        {{ isEditing ? "作業工程を編集" : "作業工程を追加" }}
      </h4>
      <button
        v-if="isEditing"
        type="button"
        class="text-xs font-black text-[#2c8d98] underline-offset-2 hover:text-[#237984] hover:underline"
        @click="emit('reset')"
      >
        新規追加に戻す
      </button>
    </div>

    <div class="mt-4 grid gap-4">
      <label class="grid gap-2">
        <span class="text-sm font-black text-[#263236]">工程セット名</span>
        <input
          v-model="name"
          type="text"
          placeholder="例: 小説"
          class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
        >
      </label>

      <div class="grid gap-2">
        <span class="text-sm font-black text-[#263236]">工程項目・作業時間(分/1P)</span>
        <div class="grid gap-2">
          <div
            v-for="(_, index) in steps"
            :key="index"
            class="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_48px]"
          >
            <input
              v-model="steps[index].name"
              type="text"
              :placeholder="`工程${index + 1}`"
              class="min-w-0 flex-1 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
            >
            <UiNumberStepper
              v-model="steps[index].minutesPerPage"
              :step="10"
              input-step="any"
              required
              aria-label="1Pあたりの作業時間（分）"
              increase-label="作業時間を10分増やす"
              decrease-label="作業時間を10分減らす"
              increase-title="10分増やす"
              decrease-title="10分減らす"
            />
            <button
              type="button"
              aria-label="工程を削除"
              title="工程を削除"
              class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
              :disabled="steps.length <= 1"
              :class="{ 'cursor-not-allowed opacity-40': steps.length <= 1 }"
              @click="emit('removeStep', index)"
            >
              −
            </button>
          </div>
        </div>
        <button
          type="button"
          class="w-fit rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
          @click="emit('addStep')"
        >
          工程を追加
        </button>
      </div>

      <button
        type="button"
        class="w-fit rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984]"
        @click="emit('save')"
      >
        作業工程を保存
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkProcessStep } from "~/types/settings";

defineProps<{
  isEditing: boolean;
}>();

const emit = defineEmits<{
  addStep: [];
  removeStep: [index: number];
  reset: [];
  save: [];
}>();

const name = defineModel<string>("name", { required: true });
// 各工程の入力はこの配列の要素を直接書き換える（配列自体はページ側の ref と共有）。
const steps = defineModel<WorkProcessStep[]>("steps", { required: true });
</script>
