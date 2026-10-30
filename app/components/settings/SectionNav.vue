<template>
  <aside class="grid gap-3 self-start">
    <template
      v-for="section in sections"
      :key="section.id"
    >
      <button
        type="button"
        class="rounded-2xl border-2 bg-white p-4 text-left shadow-[3px_3px_0_rgba(44,141,152,0.14)] transition hover:-translate-y-0.5"
        :class="selectedId === section.id ? 'border-[#263236] shadow-[4px_4px_0_rgba(38,50,54,0.18)]' : 'border-[#2c8d98] hover:bg-[#f7fcfd]'"
        @click="selectedId = section.id"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-black text-[#263236]">
              {{ section.title }}
            </h2>
            <p class="mt-1 text-sm font-bold text-[#263236]/60">
              {{ section.description }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full border-2 px-3 py-1 text-xs font-black"
            :class="section.available ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-[#d7d7d7] bg-[#edf6fa] text-[#263236]/50'"
          >
            {{ section.available ? "設定可" : "準備中" }}
          </span>
        </div>
      </button>

      <!-- スマホ用: 選択中のセクションの直下に中身を表示する -->
      <slot
        v-if="selectedId === section.id"
        name="panel"
        :section="section"
      />
    </template>
  </aside>
</template>

<script setup lang="ts">
import type { SettingSection, SettingSectionId } from "~/constants/settingSections";

defineProps<{
  sections: readonly SettingSection[];
}>();

const selectedId = defineModel<SettingSectionId>({ required: true });
</script>
