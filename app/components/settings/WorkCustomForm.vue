<template>
  <form
    class="mt-8 grid gap-5"
    @submit.prevent="handleSubmit"
  >
    <label class="grid gap-2">
      <span class="text-sm font-black text-[#263236]">新規作成時の初期ページ数</span>
      <UiNumberStepper
        v-model="defaultTotalPages"
        required
        increase-label="初期ページ数を増やす"
        decrease-label="初期ページ数を減らす"
      />
    </label>

    <SettingsCrunchThresholdFields
      v-model:warning-minutes="crunchThresholds.warningMinutes"
      v-model:crunch-minutes="crunchThresholds.crunchMinutes"
      v-model:extreme-minutes="crunchThresholds.extremeMinutes"
      :error="crunchThresholdError"
    />

    <section class="grid gap-4 border-t-2 border-dashed border-[#2c8d98] pt-6">
      <div>
        <h3 class="text-base font-black text-[#263236]">
          作業工程
        </h3>
        <p class="mt-1 text-sm font-bold text-[#263236]/60">
          制作物ごとの工程と作業時間を保存できます。
        </p>
      </div>

      <SettingsWorkProcessList
        :processes="settings.workProcesses"
        :default-process-id="settings.defaultWorkProcessId"
        @edit="editWorkProcess"
        @set-default="setDefaultWorkProcess"
        @delete="handleDeleteWorkProcess"
      />

      <SettingsWorkProcessEditor
        v-model:name="workProcessName"
        v-model:steps="workProcessSteps"
        :is-editing="Boolean(editingWorkProcessId)"
        @add-step="addWorkProcessStep"
        @remove-step="removeWorkProcessStep"
        @reset="resetWorkProcessForm"
        @save="handleSaveWorkProcess"
      />
    </section>

    <p
      v-if="savedMessage"
      class="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"
    >
      {{ savedMessage }}
    </p>

    <div class="mt-2 flex flex-wrap gap-3">
      <button
        type="submit"
        class="rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984]"
        :disabled="Boolean(crunchThresholdError)"
        :class="{ 'cursor-not-allowed opacity-50': crunchThresholdError }"
      >
        保存する
      </button>
      <button
        type="button"
        class="rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
        @click="openResetConfirm"
      >
        初期値に戻す
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
const {
  settings,
  defaultTotalPages,
  crunchThresholds,
  editingWorkProcessId,
  workProcessName,
  workProcessSteps,
  savedMessage,
  crunchThresholdError,
  resetWorkProcessForm,
  handleSubmit,
  openResetConfirm,
  editWorkProcess,
  addWorkProcessStep,
  removeWorkProcessStep,
  handleSaveWorkProcess,
  setDefaultWorkProcess,
  handleDeleteWorkProcess,
} = useWorkSettingsFormContext();
</script>
