<template>
  <section class="grid gap-4 border-t-2 border-dashed border-[#2c8d98] pt-6">
    <div>
      <h3 class="text-base font-black text-[#263236]">
        修羅場メーター
      </h3>
      <p class="mt-1 text-sm font-bold text-[#263236]/60">
        1日あたりの必要作業時間で、メーターが進む境界を決めます。
      </p>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <label class="grid min-w-0 gap-2">
        <span class="text-sm font-black text-[#263236]">一歩手前（分/日）</span>
        <UiNumberStepper
          v-model="warningMinutes"
          :step="10"
          required
          increase-label="一歩手前を10分増やす"
          decrease-label="一歩手前を10分減らす"
        />
      </label>
      <label class="grid min-w-0 gap-2">
        <span class="text-sm font-black text-[#263236]">修羅場（分/日）</span>
        <UiNumberStepper
          v-model="crunchMinutes"
          :step="10"
          required
          increase-label="修羅場を10分増やす"
          decrease-label="修羅場を10分減らす"
        />
      </label>
      <label class="grid min-w-0 gap-2">
        <span class="text-sm font-black text-[#263236]">限界修羅場（分/日）</span>
        <UiNumberStepper
          v-model="extremeMinutes"
          :step="10"
          required
          increase-label="限界修羅場を10分増やす"
          decrease-label="限界修羅場を10分減らす"
        />
      </label>
    </div>

    <p
      v-if="error"
      class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
    >
      {{ error }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  error: string;
}>();

// 入力欄を空にしたときは "" になるため、文字列も受け付ける。
const warningMinutes = defineModel<number | string>("warningMinutes", { required: true });
const crunchMinutes = defineModel<number | string>("crunchMinutes", { required: true });
const extremeMinutes = defineModel<number | string>("extremeMinutes", { required: true });
</script>
