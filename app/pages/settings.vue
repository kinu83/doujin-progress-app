<template>
  <main class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-5xl">
      <NuxtLink to="/" class="text-sm font-semibold text-gray-500">
        ← 一覧に戻る
      </NuxtLink>

      <div class="mt-4">
        <h1 class="text-2xl font-bold text-gray-900">
          設定
        </h1>
      </div>

      <div class="mt-6 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="grid gap-3 self-start">
          <template
            v-for="section in settingSections"
            :key="section.id"
          >
            <button
              type="button"
              class="rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition"
              :class="selectedSectionId === section.id ? 'ring-gray-900' : 'ring-gray-200 hover:ring-gray-300'"
              @click="selectedSectionId = section.id"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-base font-bold text-gray-900">
                    {{ section.title }}
                  </h2>
                  <p class="mt-1 text-sm font-semibold text-gray-500">
                    {{ section.description }}
                  </p>
                </div>
                <span
                  class="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
                  :class="section.available ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ section.available ? "設定可" : "準備中" }}
                </span>
              </div>
            </button>

            <section
              v-if="selectedSectionId === section.id"
              class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 lg:hidden"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">
                    {{ section.title }}
                  </h2>
                  <p class="mt-2 text-sm text-gray-500">
                    {{ section.detail }}
                  </p>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-xs font-bold"
                  :class="section.available ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ section.available ? "利用できます" : "今後追加予定" }}
                </span>
              </div>

              <form
                v-if="section.id === 'work'"
                class="mt-8 grid gap-5"
                @submit.prevent="handleSubmit"
              >
                <label class="grid gap-2">
                  <span class="text-sm font-semibold text-gray-700">新規作成時の初期ページ数</span>
                  <input
                    v-model.number="defaultTotalPages"
                    type="number"
                    min="1"
                    required
                    class="rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
                  >
                </label>

                <section class="grid gap-4 border-t border-gray-200 pt-6">
                  <div>
                    <h3 class="text-base font-bold text-gray-900">
                      作業工程
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      制作物ごとの工程と作業時間を保存できます。
                    </p>
                  </div>

                  <div class="grid gap-3">
                    <article
                      v-for="process in settings.workProcesses"
                      :key="process.id"
                      class="rounded-2xl border border-gray-200 p-4"
                    >
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div class="flex flex-wrap items-center gap-2">
                            <h4 class="font-bold text-gray-900">
                              {{ process.name }}
                            </h4>
                            <span
                              v-if="settings.defaultWorkProcessId === process.id"
                              class="rounded-full bg-gray-900 px-2 py-1 text-xs font-bold text-white"
                            >
                              既定
                            </span>
                          </div>
                          <p class="mt-2 text-sm font-semibold text-gray-500">
                            未着手 → {{ formatWorkProcessSteps(process.steps) }}
                          </p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <button
                            type="button"
                            class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
                            @click="editWorkProcess(process)"
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
                            @click="setDefaultWorkProcess(process.id)"
                          >
                            既定にする
                          </button>
                          <button
                            type="button"
                            class="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                            :disabled="settings.workProcesses.length <= 1"
                            :class="{ 'cursor-not-allowed opacity-40': settings.workProcesses.length <= 1 }"
                            @click="handleDeleteWorkProcess(process.id)"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>

                  <div class="rounded-2xl bg-gray-50 p-4">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <h4 class="font-bold text-gray-900">
                        {{ editingWorkProcessId ? "作業工程を編集" : "作業工程を追加" }}
                      </h4>
                      <button
                        v-if="editingWorkProcessId"
                        type="button"
                        class="text-xs font-bold text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
                        @click="resetWorkProcessForm"
                      >
                        新規追加に戻す
                      </button>
                    </div>

                    <div class="mt-4 grid gap-4">
                      <label class="grid gap-2">
                        <span class="text-sm font-semibold text-gray-700">工程セット名</span>
                        <input
                          v-model="workProcessName"
                          type="text"
                          placeholder="例: 小説"
                          class="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
                        >
                      </label>

                      <div class="grid gap-2">
                        <span class="text-sm font-semibold text-gray-700">工程項目・作業時間(分/1P)</span>
                        <div class="grid gap-2">
                          <div
                            v-for="(_, index) in workProcessSteps"
                            :key="index"
                            class="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_48px]"
                          >
                            <input
                              v-model="workProcessSteps[index].name"
                              type="text"
                              :placeholder="`工程${index + 1}`"
                              class="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
                            >
                            <div class="flex overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:border-gray-900">
                              <input
                                v-model.number="workProcessSteps[index].minutesPerPage"
                                type="number"
                                min="1"
                                step="any"
                                required
                                aria-label="1Pあたりの作業時間（分）"
                                class="min-w-0 flex-1 border-0 px-4 py-3 outline-none"
                              >
                              <div class="grid w-10 shrink-0 border-l border-gray-200">
                                <button
                                  type="button"
                                  aria-label="作業時間を10分増やす"
                                  title="10分増やす"
                                  class="grid place-items-center text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                                  @click="adjustWorkProcessMinutes(index, 10)"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  aria-label="作業時間を10分減らす"
                                  title="10分減らす"
                                  class="grid place-items-center border-t border-gray-200 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                                  @click="adjustWorkProcessMinutes(index, -10)"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              aria-label="工程を削除"
                              title="工程を削除"
                              class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100"
                              :disabled="workProcessSteps.length <= 1"
                              :class="{ 'cursor-not-allowed opacity-40': workProcessSteps.length <= 1 }"
                              @click="removeWorkProcessStep(index)"
                            >
                              −
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          class="w-fit rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                          @click="addWorkProcessStep"
                        >
                          工程を追加
                        </button>
                      </div>

                      <button
                        type="button"
                        class="w-fit rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
                        @click="handleSaveWorkProcess"
                      >
                        作業工程を保存
                      </button>
                    </div>
                  </div>
                </section>

                <p
                  v-if="savedMessage"
                  class="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                >
                  {{ savedMessage }}
                </p>

                <div class="mt-2 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    class="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
                  >
                    保存する
                  </button>
                  <button
                    type="button"
                    class="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                    @click="openResetConfirm"
                  >
                    初期値に戻す
                  </button>
                </div>
              </form>

              <section
                v-else-if="section.id === 'account'"
                class="mt-8 grid gap-4"
              >
                <div class="rounded-2xl border border-gray-200 p-4">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 class="text-base font-bold text-gray-900">
                        {{ accountName }}
                      </h3>
                      <p class="mt-1 text-sm font-semibold text-gray-500">
                        {{ accountStatusLabel }}
                      </p>
                    </div>
                    <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                      {{ isAuthReady ? "接続中" : "確認中" }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="mt-5 w-fit rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="isGoogleAuthLoading || isGoogleLinked"
                    @click="handleGoogleSignIn"
                  >
                    {{ googleButtonLabel }}
                  </button>
                </div>

                <p
                  v-if="accountMessage"
                  class="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                >
                  {{ accountMessage }}
                </p>
                <p
                  v-if="authError"
                  class="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {{ authError }}
                </p>
              </section>

              <div
                v-else
                class="mt-8 rounded-2xl border border-dashed border-gray-300 p-6 text-sm font-semibold text-gray-500"
              >
                この設定はまだ準備中です。
              </div>
            </section>
          </template>
        </aside>

        <section class="hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 lg:block">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                {{ selectedSection.title }}
              </h2>
              <p class="mt-2 text-sm text-gray-500">
                {{ selectedSection.detail }}
              </p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-bold"
              :class="selectedSection.available ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ selectedSection.available ? "利用できます" : "今後追加予定" }}
            </span>
          </div>

          <form
            v-if="selectedSection.id === 'work'"
            class="mt-8 grid gap-5"
            @submit.prevent="handleSubmit"
          >
            <label class="grid gap-2">
              <span class="text-sm font-semibold text-gray-700">新規作成時の初期ページ数</span>
              <input
                v-model.number="defaultTotalPages"
                type="number"
                min="1"
                required
                class="rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
              >
            </label>

            <section class="grid gap-4 border-t border-gray-200 pt-6">
              <div>
                <h3 class="text-base font-bold text-gray-900">
                  作業工程
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  制作物ごとの工程と作業時間を保存できます。
                </p>
              </div>

              <div class="grid gap-3">
                <article
                  v-for="process in settings.workProcesses"
                  :key="process.id"
                  class="rounded-2xl border border-gray-200 p-4"
                >
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <h4 class="font-bold text-gray-900">
                          {{ process.name }}
                        </h4>
                        <span
                          v-if="settings.defaultWorkProcessId === process.id"
                          class="rounded-full bg-gray-900 px-2 py-1 text-xs font-bold text-white"
                        >
                          既定
                        </span>
                      </div>
                      <p class="mt-2 text-sm font-semibold text-gray-500">
                        未着手 → {{ formatWorkProcessSteps(process.steps) }}
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
                        @click="editWorkProcess(process)"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        class="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
                        @click="setDefaultWorkProcess(process.id)"
                      >
                        既定にする
                      </button>
                      <button
                        type="button"
                        class="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                        :disabled="settings.workProcesses.length <= 1"
                        :class="{ 'cursor-not-allowed opacity-40': settings.workProcesses.length <= 1 }"
                        @click="handleDeleteWorkProcess(process.id)"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </article>
              </div>

              <div class="rounded-2xl bg-gray-50 p-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <h4 class="font-bold text-gray-900">
                    {{ editingWorkProcessId ? "作業工程を編集" : "作業工程を追加" }}
                  </h4>
                  <button
                    v-if="editingWorkProcessId"
                    type="button"
                    class="text-xs font-bold text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
                    @click="resetWorkProcessForm"
                  >
                    新規追加に戻す
                  </button>
                </div>

                <div class="mt-4 grid gap-4">
                  <label class="grid gap-2">
                    <span class="text-sm font-semibold text-gray-700">工程セット名</span>
                    <input
                      v-model="workProcessName"
                      type="text"
                      placeholder="例: 小説"
                      class="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
                    >
                  </label>

                  <div class="grid gap-2">
                    <span class="text-sm font-semibold text-gray-700">工程項目・作業時間(分/1P)</span>
                    <div class="grid gap-2">
                      <div
                        v-for="(_, index) in workProcessSteps"
                        :key="index"
                        class="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_48px]"
                      >
                        <input
                          v-model="workProcessSteps[index].name"
                          type="text"
                          :placeholder="`工程${index + 1}`"
                          class="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
                        >
                        <div class="flex overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:border-gray-900">
                          <input
                            v-model.number="workProcessSteps[index].minutesPerPage"
                            type="number"
                            min="1"
                            step="any"
                            required
                            aria-label="1Pあたりの作業時間（分）"
                            class="min-w-0 flex-1 border-0 px-4 py-3 outline-none"
                          >
                          <div class="grid w-10 shrink-0 border-l border-gray-200">
                            <button
                              type="button"
                              aria-label="作業時間を10分増やす"
                              title="10分増やす"
                              class="grid place-items-center text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                              @click="adjustWorkProcessMinutes(index, 10)"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              aria-label="作業時間を10分減らす"
                              title="10分減らす"
                              class="grid place-items-center border-t border-gray-200 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
                              @click="adjustWorkProcessMinutes(index, -10)"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="工程を削除"
                          title="工程を削除"
                          class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100"
                          :disabled="workProcessSteps.length <= 1"
                          :class="{ 'cursor-not-allowed opacity-40': workProcessSteps.length <= 1 }"
                          @click="removeWorkProcessStep(index)"
                        >
                          −
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="w-fit rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                      @click="addWorkProcessStep"
                    >
                      工程を追加
                    </button>
                  </div>

                  <button
                    type="button"
                    class="w-fit rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
                    @click="handleSaveWorkProcess"
                  >
                    作業工程を保存
                  </button>
                </div>
              </div>
            </section>

            <p
              v-if="savedMessage"
              class="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            >
              {{ savedMessage }}
            </p>

            <div class="mt-2 flex flex-wrap gap-3">
              <button
                type="submit"
                class="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
              >
                保存する
              </button>
              <button
                type="button"
                class="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                @click="openResetConfirm"
              >
                初期値に戻す
              </button>
            </div>
          </form>

          <section
            v-else-if="selectedSection.id === 'account'"
            class="mt-8 grid gap-4"
          >
            <div class="rounded-2xl border border-gray-200 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="text-base font-bold text-gray-900">
                    {{ accountName }}
                  </h3>
                  <p class="mt-1 text-sm font-semibold text-gray-500">
                    {{ accountStatusLabel }}
                  </p>
                </div>
                <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {{ isAuthReady ? "接続中" : "確認中" }}
                </span>
              </div>

              <button
                type="button"
                class="mt-5 w-fit rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isGoogleAuthLoading || isGoogleLinked"
                @click="handleGoogleSignIn"
              >
                {{ googleButtonLabel }}
              </button>
            </div>

            <p
              v-if="accountMessage"
              class="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            >
              {{ accountMessage }}
            </p>
            <p
              v-if="authError"
              class="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {{ authError }}
            </p>
          </section>

          <div
            v-else
            class="mt-8 rounded-2xl border border-dashed border-gray-300 p-6 text-sm font-semibold text-gray-500"
          >
            この設定はまだ準備中です。
          </div>
        </section>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isConfirmingReset"
        class="fixed inset-0 z-50 grid place-items-center bg-gray-900/50 px-4 py-6"
        @click.self="closeResetConfirm"
      >
        <section class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
          <div class="border-b border-amber-100 bg-amber-50 px-6 py-5">
            <p class="text-sm font-bold text-amber-700">
              初期値に戻す前の確認
            </p>
            <h2 class="mt-1 text-lg font-bold text-gray-900">
              新規作成時の初期ページ数を戻しますか？
            </h2>
          </div>

          <div class="px-6 py-5">
            <p class="text-sm leading-6 text-gray-600">
              現在の初期ページ数は、標準の {{ DEFAULT_SETTINGS.defaultTotalPages }}P に戻ります。作業工程の保存内容は変更されません。
            </p>
          </div>

          <div class="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              @click="closeResetConfirm"
            >
              キャンセル
            </button>
            <button
              type="button"
              class="rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700"
              @click="handleReset"
            >
              初期値に戻す
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import type { WorkProcess, WorkProcessStep } from "~/types/settings";
import { DEFAULT_SETTINGS } from "~/composables/useSettings";

const {
  settings,
  loadSettings,
  saveSettings,
  saveWorkProcess,
  deleteWorkProcess,
} = useSettings();
const {
  loadProjects,
} = useProjects();
const {
  user,
  isAuthReady,
  authError,
  initAuth,
  signInWithGoogle,
} = useFirebaseAuth();

const settingSections = [
  {
    id: "work",
    title: "作業カスタム",
    description: "作業時間と初期値",
    detail: "システムをユーザー好みに変えるための基本設定です。",
    available: true,
  },
  {
    id: "theme",
    title: "テーマ",
    description: "見た目の変更",
    detail: "配色や表示テーマの設定を追加予定です。",
    available: false,
  },
  {
    id: "account",
    title: "アカウント",
    description: "Google 連携",
    detail: "Google アカウントとの接続状態を管理します。",
    available: true,
  },
  {
    id: "other",
    title: "その他",
    description: "そのほかの設定",
    detail: "通知、保存、バックアップなどの設定を追加予定です。",
    available: false,
  },
] as const;

const selectedSectionId = ref<(typeof settingSections)[number]["id"]>("work");
const selectedSection = computed(() => {
  return (
    settingSections.find((section) => section.id === selectedSectionId.value) ??
    settingSections[0]
  );
});

const defaultTotalPages = ref(settings.value.defaultTotalPages);
const editingWorkProcessId = ref("");
const workProcessName = ref("");
const workProcessSteps = ref<WorkProcessStep[]>([
  { name: "", minutesPerPage: 60 },
]);
const savedMessage = ref("");
const accountMessage = ref("");
const isGoogleAuthLoading = ref(false);
const isConfirmingReset = ref(false);

const isGoogleLinked = computed(() => {
  return user.value?.providerData.some((provider) => provider.providerId === "google.com") ?? false;
});

const accountName = computed(() => {
  return user.value?.displayName || user.value?.email || "匿名アカウント";
});

const accountStatusLabel = computed(() => {
  if (!isAuthReady.value) return "認証状態を確認しています。";
  if (isGoogleLinked.value) return user.value?.email ? `Google 連携済み: ${user.value.email}` : "Google 連携済みです。";
  return "匿名アカウントで利用中です。";
});

const googleButtonLabel = computed(() => {
  if (isGoogleLinked.value) return "Google 連携済み";
  if (isGoogleAuthLoading.value) return "接続中...";
  return "Google で連携する";
});

const syncForm = () => {
  defaultTotalPages.value = settings.value.defaultTotalPages;
};

const resetWorkProcessForm = () => {
  editingWorkProcessId.value = "";
  workProcessName.value = "";
  workProcessSteps.value = [{ name: "", minutesPerPage: 60 }];
};

onMounted(() => {
  initAuth();
  loadSettings();
  loadProjects();
  syncForm();
});

const handleSubmit = () => {
  saveSettings({
    ...settings.value,
    defaultTotalPages: defaultTotalPages.value,
  });
  syncForm();
  savedMessage.value = "設定を保存しました。";
};

const openResetConfirm = () => {
  isConfirmingReset.value = true;
};

const closeResetConfirm = () => {
  isConfirmingReset.value = false;
};

const handleReset = () => {
  saveSettings({
    ...settings.value,
    defaultTotalPages: DEFAULT_SETTINGS.defaultTotalPages,
  });
  syncForm();
  closeResetConfirm();
  savedMessage.value = "初期値に戻しました。";
};

const editWorkProcess = (process: WorkProcess) => {
  editingWorkProcessId.value = process.id;
  workProcessName.value = process.name;
  workProcessSteps.value = process.steps.map((step) => ({ ...step }));
};

const addWorkProcessStep = () => {
  workProcessSteps.value.push({ name: "", minutesPerPage: 60 });
};

const removeWorkProcessStep = (index: number) => {
  if (workProcessSteps.value.length <= 1) return;

  workProcessSteps.value.splice(index, 1);
};

const adjustWorkProcessMinutes = (index: number, amount: number) => {
  const step = workProcessSteps.value[index];
  if (!step) return;

  step.minutesPerPage = Math.max(1, (Number(step.minutesPerPage) || 0) + amount);
};

const handleSaveWorkProcess = () => {
  const process = saveWorkProcess({
    id: editingWorkProcessId.value || undefined,
    name: workProcessName.value,
    steps: workProcessSteps.value,
  });

  editWorkProcess(process);
  savedMessage.value = "作業工程を保存しました。";
};

const setDefaultWorkProcess = (processId: string) => {
  saveSettings({
    ...settings.value,
    defaultWorkProcessId: processId,
  });
  savedMessage.value = "既定の作業工程を変更しました。";
};

const handleDeleteWorkProcess = (processId: string) => {
  const deleted = deleteWorkProcess(processId);
  if (!deleted) return;

  if (editingWorkProcessId.value === processId) {
    resetWorkProcessForm();
  }
  savedMessage.value = "作業工程を削除しました。";
};

const handleGoogleSignIn = async () => {
  isGoogleAuthLoading.value = true;
  accountMessage.value = "";

  try {
    await signInWithGoogle();
    await loadSettings();
    await loadProjects();
    syncForm();
    accountMessage.value = isGoogleLinked.value
      ? "Google アカウントと連携しました。"
      : "Google アカウントでログインしました。";
  } catch {
    accountMessage.value = "";
  } finally {
    isGoogleAuthLoading.value = false;
  }
};

const formatWorkProcessSteps = (steps: WorkProcessStep[]) => {
  return steps
    .map((step) => `${step.name}（${step.minutesPerPage}分）`)
    .join(" → ");
};
</script>
