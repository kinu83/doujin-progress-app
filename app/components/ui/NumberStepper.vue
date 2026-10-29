<template>
  <div class="flex overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
    <input
      v-model.number="model"
      v-bind="$attrs"
      type="number"
      :min="min"
      :step="inputStep"
      class="min-w-0 flex-1 border-0 px-4 py-3 font-bold text-[#263236] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    >
    <div class="grid w-11 shrink-0 border-l-2 border-[#2c8d98]/30">
      <button
        type="button"
        :aria-label="increaseLabel"
        :title="increaseTitle"
        class="grid place-items-center text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
        @click="adjust(step)"
      >
        ▲
      </button>
      <button
        type="button"
        :aria-label="decreaseLabel"
        :title="decreaseTitle"
        class="grid place-items-center border-t-2 border-[#2c8d98]/30 text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
        @click="adjust(-step)"
      >
        ▼
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// aria-label や required などの属性は外枠ではなく input に渡す。
defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  // ▲▼1回あたりの増減量
  step?: number;
  min?: number;
  // 入力欄の step 属性（小数を許可するときは "any"）
  inputStep?: number | "any";
  increaseLabel: string;
  decreaseLabel: string;
  increaseTitle?: string;
  decreaseTitle?: string;
}>(), {
  step: 1,
  min: 1,
  inputStep: undefined,
  increaseTitle: undefined,
  decreaseTitle: undefined,
});

// 入力欄を空にしたときは "" になるため、文字列も受け付ける。
const model = defineModel<number | string>({ required: true });

const adjust = (amount: number) => {
  model.value = Math.max(props.min, (Number(model.value) || 0) + amount);
};
</script>
