<template>
  <nav class="mt-8 grid gap-3">
    <component
      :is="link.external ? 'a' : NuxtLink"
      v-for="link in legalLinks"
      :key="link.label"
      v-bind="link.external ? { href: link.to, target: '_blank', rel: 'noopener noreferrer' } : { to: link.to }"
      class="flex items-center justify-between rounded-2xl border-2 border-[#2c8d98] bg-white p-4 text-base font-black text-[#263236] shadow-[3px_3px_0_rgba(44,141,152,0.14)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
    >
      {{ link.label }}
      <span aria-hidden="true" class="text-[#2c8d98]">{{ link.external ? "↗" : "→" }}</span>
    </component>
  </nav>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";
import { CONTACT_FORM_URL } from "~/constants/legal";

const legalLinks = [
  { label: "利用規約", to: "/terms#terms", external: false },
  { label: "プライバシーポリシー", to: "/terms#privacy", external: false },
  { label: "お問い合わせ", to: CONTACT_FORM_URL, external: true },
];
</script>
