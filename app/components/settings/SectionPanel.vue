<template>
  <section class="rounded-3xl border-4 border-[#2c8d98] bg-white p-8 shadow-[5px_5px_0_rgba(44,141,152,0.16)]">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-black text-[#263236]">
          {{ section.title }}
        </h2>
        <p class="mt-2 text-sm font-bold text-[#263236]/60">
          {{ section.detail }}
        </p>
      </div>
      <span
        class="rounded-full border-2 px-3 py-1 text-xs font-black"
        :class="section.available ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-[#d7d7d7] bg-[#edf6fa] text-[#263236]/50'"
      >
        {{ section.available ? "利用できます" : "今後追加予定" }}
      </span>
    </div>

    <SettingsWorkCustomForm v-if="section.id === 'work'" />
    <SettingsAccountPanel v-else-if="section.id === 'account'" />
    <SettingsLegalLinks v-else-if="section.id === 'legal'" />
    <div
      v-else
      class="mt-8 rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-6 text-sm font-bold text-[#263236]/60"
    >
      この設定はまだ準備中です。
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SettingSection } from "~/constants/settingSections";

defineProps<{
  section: SettingSection;
}>();
</script>
