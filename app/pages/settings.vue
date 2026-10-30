<template>
  <main class="min-h-screen bg-[#edf6fa] px-6 py-8 text-[#263236]">
    <div class="mx-auto max-w-5xl">
      <UiBackLink />

      <div class="mt-4">
        <h1 class="text-3xl font-black text-[#263236]">
          設定
        </h1>
      </div>

      <div class="mt-6 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SettingsSectionNav
          v-model="selectedSectionId"
          :sections="SETTING_SECTIONS"
        >
          <template #panel="{ section }">
            <SettingsSectionPanel
              :section="section"
              class="lg:hidden"
            />
          </template>
        </SettingsSectionNav>

        <SettingsSectionPanel
          :section="selectedSection"
          class="hidden lg:block"
        />
      </div>
    </div>

    <UiConfirmDialog
      :open="form.isConfirmingReset.value"
      tone="warning"
      eyebrow="初期値に戻す前の確認"
      title="作業カスタムの基本値を戻しますか？"
      confirm-label="初期値に戻す"
      @confirm="form.handleReset"
      @cancel="form.closeResetConfirm"
    >
      <p class="text-sm font-bold leading-6 text-[#263236]/70">
        初期ページ数は {{ DEFAULT_SETTINGS.defaultTotalPages }}P、修羅場メーターは中設定（{{ DEFAULT_CRUNCH_THRESHOLDS.warningMinutes }}分 / {{ DEFAULT_CRUNCH_THRESHOLDS.crunchMinutes }}分 / {{ DEFAULT_CRUNCH_THRESHOLDS.extremeMinutes }}分）に戻ります。作業工程の保存内容は変更されません。
      </p>
    </UiConfirmDialog>
  </main>
</template>

<script setup lang="ts">
import {
  DEFAULT_CRUNCH_THRESHOLDS,
  DEFAULT_SETTINGS,
} from "~/constants/defaultSettings";
import {
  SETTING_SECTIONS,
  type SettingSectionId,
} from "~/constants/settingSections";

const {
  loadSettings,
} = useSettings();
const {
  loadProjects,
} = useProjects();
const {
  initAuth,
} = useFirebaseAuth();

// スマホ用とPC用のパネルで同じ入力内容を共有するため、ここで1回だけ作って渡す。
const form = useWorkSettingsForm();
provide(workSettingsFormKey, form);

const selectedSectionId = ref<SettingSectionId>("work");
const selectedSection = computed(() => {
  return (
    SETTING_SECTIONS.find((section) => section.id === selectedSectionId.value) ??
    SETTING_SECTIONS[0]
  );
});

onMounted(() => {
  initAuth();
  loadSettings();
  loadProjects();
  form.syncForm();
});
</script>
