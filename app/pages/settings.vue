<template>
  <main class="min-h-screen bg-[#edf6fa] px-6 py-8 text-[#263236]">
    <div class="mx-auto max-w-5xl">
      <NuxtLink
        to="/"
        class="inline-flex items-center rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)]"
      >
        ← 一覧に戻る
      </NuxtLink>

      <div class="mt-4">
        <h1 class="text-3xl font-black text-[#263236]">
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
              class="rounded-2xl border-2 bg-white p-4 text-left shadow-[3px_3px_0_rgba(44,141,152,0.14)] transition hover:-translate-y-0.5"
              :class="selectedSectionId === section.id ? 'border-[#263236] shadow-[4px_4px_0_rgba(38,50,54,0.18)]' : 'border-[#2c8d98] hover:bg-[#f7fcfd]'"
              @click="selectedSectionId = section.id"
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

            <section
              v-if="selectedSectionId === section.id"
              class="rounded-3xl border-4 border-[#2c8d98] bg-white p-8 shadow-[5px_5px_0_rgba(44,141,152,0.16)] lg:hidden"
            >
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

              <form
                v-if="section.id === 'work'"
                class="mt-8 grid gap-5"
                @submit.prevent="handleSubmit"
              >
                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">新規作成時の初期ページ数</span>
                  <input
                    v-model.number="defaultTotalPages"
                    type="number"
                    min="1"
                    required
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                  >
                </label>

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
                    <label class="grid gap-2">
                      <span class="text-sm font-black text-[#263236]">一歩手前（分/日）</span>
                      <input
                        v-model.number="crunchThresholds.warningMinutes"
                        type="number"
                        min="1"
                        required
                        class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                      >
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-black text-[#263236]">修羅場（分/日）</span>
                      <input
                        v-model.number="crunchThresholds.crunchMinutes"
                        type="number"
                        min="1"
                        required
                        class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                      >
                    </label>
                    <label class="grid gap-2">
                      <span class="text-sm font-black text-[#263236]">限界修羅場（分/日）</span>
                      <input
                        v-model.number="crunchThresholds.extremeMinutes"
                        type="number"
                        min="1"
                        required
                        class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                      >
                    </label>
                  </div>

                  <p
                    v-if="crunchThresholdError"
                    class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                  >
                    {{ crunchThresholdError }}
                  </p>
                </section>

                <section class="grid gap-4 border-t-2 border-dashed border-[#2c8d98] pt-6">
                  <div>
                    <h3 class="text-base font-black text-[#263236]">
                      作業工程
                    </h3>
                    <p class="mt-1 text-sm font-bold text-[#263236]/60">
                      制作物ごとの工程と作業時間を保存できます。
                    </p>
                  </div>

                  <div class="grid gap-3">
                    <article
                      v-for="process in settings.workProcesses"
                      :key="process.id"
                      class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]"
                    >
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div class="flex flex-wrap items-center gap-2">
                            <h4 class="font-black text-[#263236]">
                              {{ process.name }}
                            </h4>
                            <span
                              v-if="settings.defaultWorkProcessId === process.id"
                              class="rounded-full border-2 border-[#263236] bg-[#2c8d98] px-2 py-1 text-xs font-black text-white"
                            >
                              既定
                            </span>
                          </div>
                          <p class="mt-2 text-sm font-bold text-[#263236]/60">
                            未着手 → {{ formatWorkProcessSteps(process.steps) }}
                          </p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <button
                            type="button"
                            class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-xs font-black text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                            @click="editWorkProcess(process)"
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-xs font-black text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                            @click="setDefaultWorkProcess(process.id)"
                          >
                            既定にする
                          </button>
                          <button
                            type="button"
                            class="rounded-xl border-2 border-red-500 bg-white px-3 py-2 text-xs font-black text-red-700 shadow-[2px_2px_0_rgba(220,38,38,0.16)] transition hover:-translate-y-0.5 hover:bg-red-50"
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

                  <div class="rounded-2xl border-2 border-[#2c8d98] bg-[#edf6fa] p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <h4 class="font-black text-[#263236]">
                        {{ editingWorkProcessId ? "作業工程を編集" : "作業工程を追加" }}
                      </h4>
                      <button
                        v-if="editingWorkProcessId"
                        type="button"
                        class="text-xs font-black text-[#2c8d98] underline-offset-2 hover:text-[#237984] hover:underline"
                        @click="resetWorkProcessForm"
                      >
                        新規追加に戻す
                      </button>
                    </div>

                    <div class="mt-4 grid gap-4">
                      <label class="grid gap-2">
                        <span class="text-sm font-black text-[#263236]">工程セット名</span>
                        <input
                          v-model="workProcessName"
                          type="text"
                          placeholder="例: 小説"
                          class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                        >
                      </label>

                      <div class="grid gap-2">
                        <span class="text-sm font-black text-[#263236]">工程項目・作業時間(分/1P)</span>
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
                              class="min-w-0 flex-1 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                            >
                            <div class="flex overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                              <input
                                v-model.number="workProcessSteps[index].minutesPerPage"
                                type="number"
                                min="1"
                                step="any"
                                required
                                aria-label="1Pあたりの作業時間（分）"
                                class="min-w-0 flex-1 border-0 px-4 py-3 outline-none"
                              >
                              <div class="grid w-10 shrink-0 border-l-2 border-[#2c8d98]/30">
                                <button
                                  type="button"
                                  aria-label="作業時間を10分増やす"
                                  title="10分増やす"
                                  class="grid place-items-center text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
                                  @click="adjustWorkProcessMinutes(index, 10)"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  aria-label="作業時間を10分減らす"
                                  title="10分減らす"
                                  class="grid place-items-center border-t-2 border-[#2c8d98]/30 text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
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
                              class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
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
                          class="w-fit rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                          @click="addWorkProcessStep"
                        >
                          工程を追加
                        </button>
                      </div>

                      <button
                        type="button"
                        class="w-fit rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984]"
                        @click="handleSaveWorkProcess"
                      >
                        作業工程を保存
                      </button>
                    </div>
                  </div>
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

              <section
                v-else-if="section.id === 'account'"
                class="mt-8 grid gap-4"
              >
                <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 class="text-base font-black text-[#263236]">
                        {{ accountName }}
                      </h3>
                      <p class="mt-1 text-sm font-bold text-[#263236]/60">
                        {{ accountStatusLabel }}
                      </p>
                    </div>
                    <span class="rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-3 py-1 text-xs font-black text-[#2c8d98]">
                      {{ isAuthReady ? "接続中" : "確認中" }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="mt-5 w-fit rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="isGoogleAuthLoading || isGoogleLinked"
                    @click="handleGoogleSignIn"
                  >
                    {{ googleButtonLabel }}
                  </button>
                </div>

                <p
                  v-if="accountMessage"
                  class="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"
                >
                  {{ accountMessage }}
                </p>
                <p
                  v-if="authError"
                  class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                >
                  {{ authError }}
                </p>
              </section>

              <div
                v-else
                class="mt-8 rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-6 text-sm font-bold text-[#263236]/60"
              >
                この設定はまだ準備中です。
              </div>
            </section>
          </template>
        </aside>

        <section class="hidden rounded-3xl border-4 border-[#2c8d98] bg-white p-8 shadow-[5px_5px_0_rgba(44,141,152,0.16)] lg:block">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-black text-[#263236]">
                {{ selectedSection.title }}
              </h2>
              <p class="mt-2 text-sm font-bold text-[#263236]/60">
                {{ selectedSection.detail }}
              </p>
            </div>
            <span
              class="rounded-full border-2 px-3 py-1 text-xs font-black"
              :class="selectedSection.available ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-[#d7d7d7] bg-[#edf6fa] text-[#263236]/50'"
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
              <span class="text-sm font-black text-[#263236]">新規作成時の初期ページ数</span>
              <input
                v-model.number="defaultTotalPages"
                type="number"
                min="1"
                required
                class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
              >
            </label>

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
                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">一歩手前（分/日）</span>
                  <input
                    v-model.number="crunchThresholds.warningMinutes"
                    type="number"
                    min="1"
                    required
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                  >
                </label>
                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">修羅場（分/日）</span>
                  <input
                    v-model.number="crunchThresholds.crunchMinutes"
                    type="number"
                    min="1"
                    required
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                  >
                </label>
                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">限界修羅場（分/日）</span>
                  <input
                    v-model.number="crunchThresholds.extremeMinutes"
                    type="number"
                    min="1"
                    required
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                  >
                </label>
              </div>

              <p
                v-if="crunchThresholdError"
                class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
              >
                {{ crunchThresholdError }}
              </p>
            </section>

            <section class="grid gap-4 border-t-2 border-dashed border-[#2c8d98] pt-6">
              <div>
                <h3 class="text-base font-black text-[#263236]">
                  作業工程
                </h3>
                <p class="mt-1 text-sm font-bold text-[#263236]/60">
                  制作物ごとの工程と作業時間を保存できます。
                </p>
              </div>

              <div class="grid gap-3">
                <article
                  v-for="process in settings.workProcesses"
                  :key="process.id"
                  class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]"
                >
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <h4 class="font-black text-[#263236]">
                          {{ process.name }}
                        </h4>
                        <span
                          v-if="settings.defaultWorkProcessId === process.id"
                          class="rounded-full border-2 border-[#263236] bg-[#2c8d98] px-2 py-1 text-xs font-black text-white"
                        >
                          既定
                        </span>
                      </div>
                      <p class="mt-2 text-sm font-bold text-[#263236]/60">
                        未着手 → {{ formatWorkProcessSteps(process.steps) }}
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-xs font-black text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                        @click="editWorkProcess(process)"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        class="rounded-xl border-2 border-[#263236] bg-white px-3 py-2 text-xs font-black text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                        @click="setDefaultWorkProcess(process.id)"
                      >
                        既定にする
                      </button>
                      <button
                        type="button"
                        class="rounded-xl border-2 border-red-500 bg-white px-3 py-2 text-xs font-black text-red-700 shadow-[2px_2px_0_rgba(220,38,38,0.16)] transition hover:-translate-y-0.5 hover:bg-red-50"
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

              <div class="rounded-2xl border-2 border-[#2c8d98] bg-[#edf6fa] p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <h4 class="font-black text-[#263236]">
                    {{ editingWorkProcessId ? "作業工程を編集" : "作業工程を追加" }}
                  </h4>
                  <button
                    v-if="editingWorkProcessId"
                    type="button"
                    class="text-xs font-black text-[#2c8d98] underline-offset-2 hover:text-[#237984] hover:underline"
                    @click="resetWorkProcessForm"
                  >
                    新規追加に戻す
                  </button>
                </div>

                <div class="mt-4 grid gap-4">
                  <label class="grid gap-2">
                    <span class="text-sm font-black text-[#263236]">工程セット名</span>
                    <input
                      v-model="workProcessName"
                      type="text"
                      placeholder="例: 小説"
                      class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                    >
                  </label>

                  <div class="grid gap-2">
                    <span class="text-sm font-black text-[#263236]">工程項目・作業時間(分/1P)</span>
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
                          class="min-w-0 flex-1 rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
                        >
                        <div class="flex overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                          <input
                            v-model.number="workProcessSteps[index].minutesPerPage"
                            type="number"
                            min="1"
                            step="any"
                            required
                            aria-label="1Pあたりの作業時間（分）"
                            class="min-w-0 flex-1 border-0 px-4 py-3 outline-none"
                          >
                          <div class="grid w-10 shrink-0 border-l-2 border-[#2c8d98]/30">
                            <button
                              type="button"
                              aria-label="作業時間を10分増やす"
                              title="10分増やす"
                              class="grid place-items-center text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
                              @click="adjustWorkProcessMinutes(index, 10)"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              aria-label="作業時間を10分減らす"
                              title="10分減らす"
                              class="grid place-items-center border-t-2 border-[#2c8d98]/30 text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
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
                          class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] shadow-[2px_2px_0_rgba(38,50,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
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
                      class="w-fit rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                      @click="addWorkProcessStep"
                    >
                      工程を追加
                    </button>
                  </div>

                  <button
                    type="button"
                    class="w-fit rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984]"
                    @click="handleSaveWorkProcess"
                  >
                    作業工程を保存
                  </button>
                </div>
              </div>
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

          <section
            v-else-if="selectedSection.id === 'account'"
            class="mt-8 grid gap-4"
          >
            <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="text-base font-black text-[#263236]">
                    {{ accountName }}
                  </h3>
                  <p class="mt-1 text-sm font-bold text-[#263236]/60">
                    {{ accountStatusLabel }}
                  </p>
                </div>
                <span class="rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-3 py-1 text-xs font-black text-[#2c8d98]">
                  {{ isAuthReady ? "接続中" : "確認中" }}
                </span>
              </div>

              <button
                type="button"
                class="mt-5 w-fit rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isGoogleAuthLoading || isGoogleLinked"
                @click="handleGoogleSignIn"
              >
                {{ googleButtonLabel }}
              </button>
            </div>

            <p
              v-if="accountMessage"
              class="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"
            >
              {{ accountMessage }}
            </p>
            <p
              v-if="authError"
              class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
            >
              {{ authError }}
            </p>
          </section>

          <div
            v-else
            class="mt-8 rounded-2xl border-2 border-dashed border-[#2c8d98] bg-[#edf6fa] p-6 text-sm font-bold text-[#263236]/60"
          >
            この設定はまだ準備中です。
          </div>
        </section>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isConfirmingReset"
        class="fixed inset-0 z-50 grid place-items-center bg-[#263236]/50 px-4 py-6"
        @click.self="closeResetConfirm"
      >
        <section class="w-full max-w-md overflow-hidden rounded-3xl border-4 border-amber-500 bg-white shadow-[5px_5px_0_rgba(245,158,11,0.18)]">
          <div class="border-b-2 border-amber-500 bg-amber-50 px-6 py-5">
            <p class="text-sm font-black text-amber-700">
              初期値に戻す前の確認
            </p>
            <h2 class="mt-1 text-lg font-black text-[#263236]">
              作業カスタムの基本値を戻しますか？
            </h2>
          </div>

          <div class="px-6 py-5">
            <p class="text-sm font-bold leading-6 text-[#263236]/70">
              初期ページ数は {{ DEFAULT_SETTINGS.defaultTotalPages }}P、修羅場メーターは中設定（{{ DEFAULT_CRUNCH_THRESHOLDS.warningMinutes }}分 / {{ DEFAULT_CRUNCH_THRESHOLDS.crunchMinutes }}分 / {{ DEFAULT_CRUNCH_THRESHOLDS.extremeMinutes }}分）に戻ります。作業工程の保存内容は変更されません。
            </p>
          </div>

          <div class="flex flex-col-reverse gap-3 border-t-2 border-amber-100 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
              @click="closeResetConfirm"
            >
              キャンセル
            </button>
            <button
              type="button"
              class="rounded-xl border-2 border-amber-700 bg-amber-600 px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:bg-amber-700"
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
import {
  DEFAULT_CRUNCH_THRESHOLDS,
  DEFAULT_SETTINGS,
} from "~/constants/defaultSettings";

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
const crunchThresholds = reactive({ ...settings.value.crunchThresholds });
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
  crunchThresholds.warningMinutes = settings.value.crunchThresholds.warningMinutes;
  crunchThresholds.crunchMinutes = settings.value.crunchThresholds.crunchMinutes;
  crunchThresholds.extremeMinutes = settings.value.crunchThresholds.extremeMinutes;
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
  if (crunchThresholdError.value) return;

  saveSettings({
    ...settings.value,
    defaultTotalPages: defaultTotalPages.value,
    crunchThresholds: { ...crunchThresholds },
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
    crunchThresholds: { ...DEFAULT_CRUNCH_THRESHOLDS },
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

const crunchThresholdError = computed(() => {
  const warning = Math.round(Number(crunchThresholds.warningMinutes) || 0);
  const crunch = Math.round(Number(crunchThresholds.crunchMinutes) || 0);
  const extreme = Math.round(Number(crunchThresholds.extremeMinutes) || 0);

  if (warning < 1 || crunch < 1 || extreme < 1) {
    return "修羅場メーターの値は1分以上で設定してください。";
  }

  if (!(warning < crunch && crunch < extreme)) {
    return "一歩手前、修羅場、限界修羅場の順に大きい数値を設定してください。";
  }

  return "";
});

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
