<template>
  <main class="min-h-screen bg-[#edf6fa] px-6 py-8 text-[#263236]">
    <div class="mx-auto max-w-5xl">
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink
          to="/"
          class="inline-flex items-center rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)]"
        >
          ← 一覧に戻る
        </NuxtLink>
        <NuxtLink
          to="/calendar"
          aria-label="カレンダーを表示"
          title="カレンダー"
          class="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)]"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="3" />
            <path d="M3 10h18" />
          </svg>
        </NuxtLink>
      </div>

      <div v-if="project" class="mt-4 grid gap-6">
        <section class="rounded-3xl border-4 border-[#2c8d98] bg-white p-5 shadow-[5px_5px_0_rgba(44,141,152,0.16)] sm:p-8">
          <div class="grid gap-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <h1 class="break-words text-3xl font-black text-[#263236]">
                    {{ project.title }}
                  </h1>
                  <span
                    v-if="formatEventLabel(project)"
                    class="rounded-full border-2 border-[#2c8d98] bg-[#edf6fa] px-3 py-1 text-xs font-black text-[#2c8d98]"
                  >
                    {{ formatEventLabel(project) }}
                  </span>
                </div>
              </div>

              <div class="flex shrink-0 flex-wrap justify-end gap-2">
                <button
                  type="button"
                  class="rounded-xl border-2 border-red-500 bg-white px-4 py-2 text-sm font-black text-red-700 shadow-[3px_3px_0_rgba(220,38,38,0.16)] transition hover:-translate-y-0.5 hover:bg-red-50"
                  @click="openDeleteConfirm"
                >
                  削除
                </button>
                <button
                  type="button"
                  class="rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                  @click="startInfoEdit"
                >
                  情報を編集
                </button>
              </div>
            </div>

            <div class="grid gap-1 border-b-2 border-dashed border-[#2c8d98] pb-3 text-sm font-black text-[#263236] sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
              <span class="flex flex-wrap gap-x-2">
                <span class="text-xs text-[#263236]/60">入稿締切日</span>
                <span>{{ formatProjectDate(project.deadline) }}</span>
              </span>
              <span v-if="project.startDate" class="flex flex-wrap gap-x-2 sm:border-l-2 sm:border-[#2c8d98]/50 sm:pl-4">
                <span class="text-xs text-[#263236]/60">作業開始日</span>
                <span>{{ formatProjectDate(project.startDate) }}</span>
              </span>
              <span v-else class="text-[#263236]/50">
                作業開始日は未設定です
              </span>
            </div>

            <div class="text-right font-black text-[#263236]">
              <p class="text-4xl leading-none">
                {{ projectProgress }}%
              </p>
              <p class="text-sm">
                全体進捗
              </p>
            </div>
          </div>

          <div class="mt-5 h-5 overflow-hidden rounded-full bg-[#d7d7d7] shadow-inner">
            <div
              class="h-full rounded-full bg-[#2c8d98] shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)]"
              :style="{ width: `${projectProgress}%` }"
            />
          </div>

          <div
            class="mt-5 rounded-2xl border-2 p-4 font-bold shadow-[3px_3px_0_rgba(38,50,54,0.12)]"
            :class="getCrunchLevelClasses(projectCrunchLevel.tone)"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-black">
                  修羅場レベル
                </p>
                <p class="mt-1 text-2xl font-black">
                  {{ projectCrunchLevel.label }}
                </p>
              </div>
              <div class="flex gap-1" aria-hidden="true">
                <span
                  v-for="level in 5"
                  :key="level"
                  class="h-3 w-3 rounded-full"
                  :class="level <= projectCrunchLevel.intensity ? 'bg-current' : 'bg-current/20'"
                />
              </div>
            </div>
            <p class="mt-2 text-sm leading-6">
              {{ projectCrunchLevel.message }}
            </p>
          </div>

          <div class="mt-5 grid gap-3 text-sm text-[#263236] md:grid-cols-4">
            <NuxtLink
              :to="{ path: '/calendar', query: { date: todayKey } }"
              class="rounded-2xl border-2 border-[#ff4b1f] bg-[#fff2e3] p-4 font-black shadow-[3px_3px_0_rgba(255,75,31,0.22)] transition hover:-translate-y-0.5 hover:bg-[#fff7ef]"
            >
              <span class="block text-xs">今日の必要時間</span>
              <span class="text-2xl leading-tight text-[#f36b00]">{{ formatWorkDuration(projectDailyWork) }}</span>
            </NuxtLink>
            <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 font-black shadow-[3px_3px_0_rgba(44,141,152,0.2)]">
              <span class="block text-xs">残り日数</span>
              <span class="text-2xl leading-tight text-[#2c8d98]">{{ calculateDaysLeft(project.deadline) }}日</span>
            </div>
            <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 font-black shadow-[3px_3px_0_rgba(44,141,152,0.2)]">
              <span class="block text-xs">残ページ数</span>
              <span class="text-2xl leading-tight text-[#2c8d98]">{{ formatRemainingPages(project) }}P</span>
            </div>
            <div class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 font-black shadow-[3px_3px_0_rgba(44,141,152,0.2)]">
              <span class="block text-xs">残り作業時間</span>
              <span class="text-2xl leading-tight text-[#2c8d98]">{{ formatWorkDuration(projectRemainingWork) }}</span>
            </div>
          </div>

          <div class="mt-4 text-sm font-bold text-[#263236]/70">
            <div
              v-if="isMemoOpen"
              class="rounded-2xl border-2 border-[#2c8d98]/30 bg-white px-4 py-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 font-black text-[#263236] transition hover:text-[#2c8d98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8d98] focus-visible:ring-offset-2"
                  :aria-expanded="isBookSpecOpen"
                  aria-label="本の情報を開閉"
                  @click="isBookSpecOpen = !isBookSpecOpen"
                >
                  <span
                    class="text-xs transition-transform"
                    :class="{ 'rotate-90': isBookSpecOpen }"
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                  <span>本の情報</span>
                </button>
                <button
                  type="button"
                  class="rounded-lg border-2 border-[#2c8d98] bg-white px-3 py-1 text-xs font-black text-[#2c8d98] shadow-[2px_2px_0_rgba(44,141,152,0.16)] transition hover:-translate-y-0.5 hover:bg-[#edf6fa]"
                  @click="startBookSpecEdit"
                >
                  編集
                </button>
              </div>
              <dl
                v-if="isBookSpecOpen"
                class="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2"
              >
                <div
                  v-for="item in bookSpecItems"
                  :key="item.label"
                  class="min-w-0 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3"
                >
                  <dt class="text-xs font-black text-[#263236]/55">
                    {{ item.label }}
                  </dt>
                  <dd class="whitespace-pre-wrap break-words text-sm font-black text-[#263236]">
                    {{ item.value }}
                  </dd>
                </div>
              </dl>
            </div>
            <button
              type="button"
              class="mx-auto mt-3 flex w-fit items-center px-3 py-1 text-sm leading-none text-[#2c8d98] transition hover:text-[#237984] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8d98] focus-visible:ring-offset-2"
              :aria-expanded="isMemoOpen"
              aria-label="メモ欄を開閉"
              @click="isMemoOpen = !isMemoOpen"
            >
              <span
                class="transition-transform"
                :class="{ 'rotate-180': isMemoOpen }"
                aria-hidden="true"
              >
                ▼
              </span>
            </button>
          </div>
        </section>

        <section class="rounded-3xl border-4 border-[#2c8d98] bg-white p-8 shadow-[5px_5px_0_rgba(44,141,152,0.16)]">
          <h2 class="text-xl font-black text-[#263236]">
            ページ別進捗
          </h2>
          <p class="mt-1 text-sm font-black text-[#263236]/60">
            入力対象日: {{ selectedWorkDateLabel }}
          </p>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div
              v-for="page in project.pages"
              :key="page.pageNumber"
              class="rounded-2xl border-2 border-[#2c8d98] bg-white p-4 shadow-[3px_3px_0_rgba(44,141,152,0.14)]"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="font-black text-[#263236]">
                  {{ page.pageNumber }}P
                </p>
                <span class="text-sm font-black text-[#263236]/70">
                  {{ page.status }}・{{ calculatePageProgress(page, project.workProcessSteps) }}%
                </span>
              </div>

              <button
                type="button"
                class="group mt-3 w-full rounded-full py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8d98] focus-visible:ring-offset-2"
                role="slider"
                :aria-label="`${page.pageNumber}Pの進捗ステップ`"
                :aria-valuemin="0"
                :aria-valuemax="statuses.length - 1"
                :aria-valuenow="getPageStatusIndex(page.status)"
                :aria-valuetext="page.status"
                @click="handleProgressBarClick(page.pageNumber, $event)"
                @keydown="handleProgressBarKeydown(page.pageNumber, page.status, $event)"
              >
                <div class="relative h-3 overflow-hidden rounded-full bg-[#d7d7d7] shadow-inner">
                  <div
                    class="h-full rounded-full bg-[#2c8d98] transition-[width]"
                    :style="{ width: `${getPageStatusPercent(page.status)}%` }"
                  />
                </div>
                <div
                  class="relative mt-1 h-3"
                  aria-hidden="true"
                >
                  <span
                    v-for="(status, index) in statuses"
                    :key="status"
                    class="absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 bg-white transition group-hover:border-[#2c8d98]"
                    :class="index <= getPageStatusIndex(page.status) ? 'border-[#2c8d98]' : 'border-[#d7d7d7]'"
                    :style="{ left: `${getStatusIndexPercent(index)}%` }"
                  />
                </div>
              </button>

            </div>
          </div>
        </section>

        <Teleport to="body">
          <div
            v-if="isConfirmingDelete"
            class="fixed inset-0 z-50 grid place-items-center bg-[#263236]/50 px-4 py-6"
            @click.self="closeDeleteConfirm"
          >
            <section class="w-full max-w-md overflow-hidden rounded-3xl border-4 border-red-500 bg-white shadow-[5px_5px_0_rgba(220,38,38,0.18)]">
              <div class="border-b-2 border-red-500 bg-red-50 px-6 py-5">
                <p class="text-sm font-black text-red-700">
                  削除前の確認
                </p>
                <h2 class="mt-1 text-lg font-black text-[#263236]">
                  この作品情報を削除しますか？
                </h2>
              </div>

              <div class="px-6 py-5">
                <p class="text-sm font-bold leading-6 text-[#263236]/70">
                  「{{ project.title }}」とページ別進捗は完全に削除されます。この操作は元に戻せません。
                </p>
                <p
                  v-if="deleteError"
                  class="mt-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                >
                  {{ deleteError }}
                </p>
              </div>

              <div class="flex flex-col-reverse gap-3 border-t-2 border-red-100 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  class="rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                  @click="closeDeleteConfirm"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  :disabled="isDeleting"
                  class="rounded-xl border-2 border-red-700 bg-red-600 px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(220,38,38,0.28)] transition hover:-translate-y-0.5 hover:bg-red-700"
                  @click="handleDelete"
                >
                  {{ isDeleting ? "削除中..." : "削除する" }}
                </button>
              </div>
            </section>
          </div>
        </Teleport>

        <Teleport to="body">
          <div
            v-if="isEditingInfo"
            class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#263236]/50 px-4 py-6"
            @click.self="cancelInfoEdit"
          >
            <form
              class="flex max-h-[calc(100dvh-3rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border-4 border-[#2c8d98] bg-white shadow-[5px_5px_0_rgba(44,141,152,0.18)]"
              @submit.prevent="handleInfoSubmit"
            >
              <div class="shrink-0 border-b-2 border-dashed border-[#2c8d98] px-6 py-5">
                <h2 class="text-lg font-black text-[#263236]">
                  プロジェクト情報を編集
                </h2>
                <p class="mt-1 text-sm font-bold text-[#263236]/60">
                  作業開始日や締切など、進捗計算に使う情報を更新できます。
                </p>
              </div>

              <div class="grid gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
                <label class="grid gap-2 md:col-span-2">
                  <span class="text-sm font-black text-[#263236]">タイトル</span>
                  <input
                    v-model="editTitle"
                    type="text"
                    required
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>
                
                <label class="grid gap-2 md:col-span-2">
                  <span class="text-sm font-black text-[#263236]">イベント名</span>
                  <input
                    v-model="editEventName"
                    type="text"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2 md:col-span-2">
                  <span class="text-sm font-black text-[#263236]">イベント開催日</span>
                  <input
                    v-model="editEventDate"
                    type="date"
                    :min="editDeadline || undefined"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">作業開始日</span>
                  <input
                    v-model="editStartDate"
                    type="date"
                    :max="editDeadline"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">締切日</span>
                  <input
                    v-model="editDeadline"
                    type="date"
                    required
                    :min="editStartDate || undefined"
                    :max="editEventDate || undefined"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">ページ数</span>
                  <div class="flex overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                    <input
                      v-model.number="editTotalPages"
                      type="number"
                      min="1"
                      required
                      class="min-w-0 flex-1 border-0 px-4 py-3 font-bold text-[#263236] outline-none"
                    >
                    <div class="grid w-11 shrink-0 border-l-2 border-[#2c8d98]/30">
                      <button
                        type="button"
                        aria-label="ページ数を増やす"
                        class="grid place-items-center text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
                        @click="incrementEditTotalPages"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        aria-label="ページ数を減らす"
                        class="grid place-items-center border-t-2 border-[#2c8d98]/30 text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
                        @click="decrementEditTotalPages"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">作業工程</span>
                  <select
                    v-model="editWorkProcessId"
                    class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                    <option
                      v-for="process in settings.workProcesses"
                      :key="process.id"
                      :value="process.id"
                    >
                      {{ process.name }}
                    </option>
                  </select>
                </label>

                <p
                  v-if="infoEditError"
                  class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 md:col-span-2"
                >
                  {{ infoEditError }}
                </p>
              </div>

              <div class="shrink-0 flex flex-col-reverse gap-3 border-t-2 border-dashed border-[#2c8d98] px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  class="rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                  @click="cancelInfoEdit"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  :disabled="!canSaveInfo"
                  class="rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984] disabled:cursor-not-allowed disabled:border-[#d7d7d7] disabled:bg-[#d7d7d7]"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </Teleport>

        <Teleport to="body">
          <div
            v-if="isEditingBookSpec"
            class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#263236]/50 px-4 py-6"
            @click.self="cancelBookSpecEdit"
          >
            <form
              class="flex max-h-[calc(100dvh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-4 border-[#2c8d98] bg-white shadow-[5px_5px_0_rgba(44,141,152,0.18)]"
              @submit.prevent="handleBookSpecSubmit"
            >
              <div class="shrink-0 border-b-2 border-dashed border-[#2c8d98] px-6 py-5">
                <h2 class="text-lg font-black text-[#263236]">
                  本の情報を編集
                </h2>
                <p class="mt-1 text-sm font-bold text-[#263236]/60">
                  ページ数や印刷仕様を更新できます。
                </p>
              </div>

              <div class="grid gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">ページ数</span>
                  <div class="flex overflow-hidden rounded-xl border-2 border-[#2c8d98]/40 bg-white focus-within:border-[#2c8d98]">
                    <input
                      v-model.number="bookSpecForm.totalPages"
                      type="number"
                      min="1"
                      required
                      class="min-w-0 flex-1 border-0 px-4 py-3 font-bold text-[#263236] outline-none"
                    >
                    <div class="grid w-11 shrink-0 border-l-2 border-[#2c8d98]/30">
                      <button
                        type="button"
                        aria-label="ページ数を増やす"
                        class="grid place-items-center text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
                        @click="incrementBookSpecTotalPages"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        aria-label="ページ数を減らす"
                        class="grid place-items-center border-t-2 border-[#2c8d98]/30 text-xs font-black text-[#263236] transition hover:bg-[#edf6fa]"
                        @click="decrementBookSpecTotalPages"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">カラー</span>
                  <select
                    v-model="bookSpecForm.colorMode"
                    class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                    <option
                      v-for="colorMode in colorModes"
                      :key="colorMode"
                      :value="colorMode"
                    >
                      {{ colorMode }}
                    </option>
                  </select>
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">表紙の紙</span>
                  <input
                    v-model="bookSpecForm.coverPaper"
                    type="text"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">本文の紙</span>
                  <input
                    v-model="bookSpecForm.bodyPaper"
                    type="text"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">印刷会社</span>
                  <input
                    v-model="bookSpecForm.printer"
                    type="text"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">発行部数</span>
                  <input
                    v-model.number="bookSpecForm.printRun"
                    type="number"
                    min="0"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-black text-[#263236]">予算</span>
                  <input
                    v-model.number="bookSpecForm.budget"
                    type="number"
                    min="0"
                    class="rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  >
                </label>

                <label class="grid gap-2 md:col-span-2">
                  <span class="text-sm font-black text-[#263236]">メモ</span>
                  <textarea
                    v-model="bookSpecForm.note"
                    rows="5"
                    class="resize-y rounded-xl border-2 border-[#2c8d98]/40 px-4 py-3 font-bold leading-6 text-[#263236] outline-none transition focus:border-[#2c8d98]"
                  />
                </label>
              </div>

              <div class="shrink-0 flex flex-col-reverse gap-3 border-t-2 border-dashed border-[#2c8d98] px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  class="rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
                  @click="cancelBookSpecEdit"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  class="rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984]"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </Teleport>
      </div>

      <div v-else class="mt-6 rounded-3xl border-4 border-dashed border-[#2c8d98] bg-white p-8 text-center shadow-[5px_5px_0_rgba(44,141,152,0.18)]">
        <p class="text-lg font-black text-[#263236]">
          プロジェクトが見つかりません
        </p>
        <p class="mt-2 text-sm font-bold text-[#263236]/60">
          一覧から作成し直してください。
        </p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { createStatusList, useProgress } from "~/composables/useProgress";
import { useProjects } from "~/composables/useProjects";
import type { PageStatus, PrintColorMode } from "~/types/project";
import { getCrunchLevelClasses } from "~/utils/crunchLevelDisplay";
import { formatEventLabel, formatProjectDate } from "~/utils/projectDisplay";

const route = useRoute();
const router = useRouter();
const {
  getProjectById,
  loadProjects,
  deleteProject,
  updatePageStatus,
  updateProjectInfo,
  updateBookSpec,
  getProjectDailyActualMinutes,
} = useProjects();
const { settings, loadSettings } = useSettings();
const {
  calculateTotalProgress,
  calculateRemainingWork,
  calculateDaysLeft,
  calculateDailyWork,
  calculateCrunchLevel,
  calculatePageProgress,
  formatWorkDuration,
} = useProgress();

const colorModes: PrintColorMode[] = ["フルカラー", "モノクロ"];

onMounted(() => {
  loadSettings();
  loadProjects();
});

const project = computed(() => getProjectById(String(route.params.id)));
const projectProgress = computed(() => {
  if (!project.value) return 0;

  return calculateTotalProgress(project.value.pages, project.value.workProcessSteps);
});
const projectRemainingWork = computed(() => {
  if (!project.value) return 0;

  return calculateRemainingWork(project.value.pages, project.value.workProcessSteps);
});
const projectDailyWork = computed(() => {
  if (!project.value) return 0;

  return calculateDailyWork(project.value.pages, project.value.deadline, project.value.workProcessSteps);
});
const projectCrunchLevel = computed(() => {
  const currentProject = project.value;

  // 設定画面のしきい値を反映して、作品ごとに現在の危険度を再計算する。
  return calculateCrunchLevel(
    currentProject?.pages ?? [],
    currentProject?.deadline ?? "",
    currentProject?.startDate ?? "",
    currentProject?.workProcessSteps,
    settings.value.crunchThresholds
  );
});
const statuses = computed<PageStatus[]>(() => {
  // ページ進捗の入力候補は、プロジェクトに保存された工程定義から作る。
  return createStatusList(project.value?.workProcessSteps);
});
const todayKey = computed(() => formatDateKey(new Date()));
const selectedWorkDateKey = computed(() => {
  const queryValue = Array.isArray(route.query.workDate)
    ? route.query.workDate[0]
    : route.query.workDate;

  // カレンダーから来た日付だけを採用し、直接アクセス時は今日の実績入力にする。
  return isDateKey(queryValue) ? queryValue : todayKey.value;
});
const selectedWorkDailyEntry = computed(() => {
  if (!project.value) {
    return {
      planned: 0,
      actual: 0,
    };
  }

  const entry = project.value.dailyWorkEntries[selectedWorkDateKey.value] ?? {
    planned: 0,
    actual: 0,
  };

  return {
    planned: entry.planned,
    // 実績はdailyWorkEntriesのキャッシュではなく、ログ優先の集計値を表示する。
    actual: getProjectDailyActualMinutes(project.value.id, selectedWorkDateKey.value),
  };
});
const selectedWorkDateLabel = computed(() => {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseDateKey(selectedWorkDateKey.value));
});
const selectedWorkDateSummaryLabel = computed(() => {
  return selectedWorkDateKey.value === todayKey.value
    ? "今日の作業時間"
    : `${selectedWorkDateLabel.value}の作業時間`;
});
const formatBookSpecText = (value: string | number, unit = "") => {
  const text = typeof value === "number"
    ? value > 0 ? `${value.toLocaleString()}${unit}` : ""
    : value.trim();

  return {
    value: text,
    isEmpty: !text,
  };
};
const bookSpecItems = computed(() => {
  if (!project.value) return [];

  const currentProject = project.value;

  return [
    {
      label: "ページ数",
      value: `${currentProject.totalPages.toLocaleString()}P`,
      isEmpty: false,
    },
    {
      label: "作業工程",
      ...formatBookSpecText(currentProject.workProcessName),
    },
    {
      label: "カラー",
      ...formatBookSpecText(currentProject.bookSpec.colorMode),
    },
    {
      label: "表紙の紙",
      ...formatBookSpecText(currentProject.bookSpec.coverPaper),
    },
    {
      label: "本文の紙",
      ...formatBookSpecText(currentProject.bookSpec.bodyPaper),
    },
    {
      label: "印刷会社",
      ...formatBookSpecText(currentProject.bookSpec.printer),
    },
    {
      label: "発行部数",
      ...formatBookSpecText(currentProject.bookSpec.printRun, "部"),
    },
    {
      label: "予算",
      ...formatBookSpecText(currentProject.bookSpec.budget, "円"),
    },
    {
      label: "メモ",
      ...formatBookSpecText(currentProject.bookSpec.note),
    },
  ].filter((item) => !item.isEmpty);
});

const formatRemainingPages = (project: NonNullable<typeof project.value>) => {
  // 最後の工程に到達したページだけを完了ページとして数える。
  const finalStatus = project.workProcessSteps[project.workProcessSteps.length - 1]?.name;
  const completedPages = project.pages.filter((page) => page.status === finalStatus).length;
  const remainingPages = Math.max(project.totalPages - completedPages, 0);

  return `${remainingPages}/${project.totalPages}`;
};

const isEditingInfo = ref(false);
const isEditingBookSpec = ref(false);
const isConfirmingDelete = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");
const isMemoOpen = ref(false);
const isBookSpecOpen = ref(false);
const editEventName = ref("");
const editTitle = ref("");
const editStartDate = ref("");
const editEventDate = ref("");
const editDeadline = ref("");
const editTotalPages = ref(1);
const editWorkProcessId = ref("");
const bookSpecForm = reactive({
  totalPages: 1,
  colorMode: "モノクロ" as PrintColorMode,
  coverPaper: "",
  bodyPaper: "",
  printer: "",
  printRun: 0,
  budget: 0,
  note: "",
});

const isStartDateAfterDeadline = computed(() => {
  if (!editStartDate.value || !editDeadline.value) return false;

  return editStartDate.value > editDeadline.value;
});

const infoEditError = computed(() => {
  if (isStartDateAfterDeadline.value) {
    return "作業開始日は締切日以前の日付を設定してください。";
  }

  if (editDeadline.value && editEventDate.value && editDeadline.value > editEventDate.value) {
    return "原稿締切はイベント日以前の日付を設定してください。";
  }

  return "";
});

const canSaveInfo = computed(() => {
  return !infoEditError.value;
});

const fillInfoForm = () => {
  if (!project.value) return;

  editEventName.value = project.value.eventName;
  editTitle.value = project.value.title;
  editStartDate.value = project.value.startDate;
  editEventDate.value = project.value.eventDate;
  editDeadline.value = project.value.deadline;
  editTotalPages.value = project.value.totalPages;
  editWorkProcessId.value = project.value.workProcessId;
};

const fillBookSpecForm = () => {
  if (!project.value) return;

  bookSpecForm.totalPages = project.value.totalPages;
  bookSpecForm.colorMode = project.value.bookSpec.colorMode;
  bookSpecForm.coverPaper = project.value.bookSpec.coverPaper;
  bookSpecForm.bodyPaper = project.value.bookSpec.bodyPaper;
  bookSpecForm.printer = project.value.bookSpec.printer;
  bookSpecForm.printRun = project.value.bookSpec.printRun;
  bookSpecForm.budget = project.value.bookSpec.budget;
  bookSpecForm.note = project.value.bookSpec.note;
};

const startInfoEdit = () => {
  fillInfoForm();
  isEditingInfo.value = true;
};

const cancelInfoEdit = () => {
  // キャンセル時は編集中の入力を破棄して、保存済みの値へ戻す。
  fillInfoForm();
  isEditingInfo.value = false;
};

const startBookSpecEdit = () => {
  fillBookSpecForm();
  isEditingBookSpec.value = true;
};

const cancelBookSpecEdit = () => {
  // 仕様編集も同じく、モーダルを閉じる前にフォームを保存済み状態へ戻す。
  fillBookSpecForm();
  isEditingBookSpec.value = false;
};

const incrementEditTotalPages = () => {
  editTotalPages.value = Math.max(1, Number(editTotalPages.value) || 1) + 1;
};

const decrementEditTotalPages = () => {
  editTotalPages.value = Math.max(1, (Number(editTotalPages.value) || 1) - 1);
};

const incrementBookSpecTotalPages = () => {
  bookSpecForm.totalPages = Math.max(1, Number(bookSpecForm.totalPages) || 1) + 1;
};

const decrementBookSpecTotalPages = () => {
  bookSpecForm.totalPages = Math.max(1, (Number(bookSpecForm.totalPages) || 1) - 1);
};

const openDeleteConfirm = () => {
  deleteError.value = "";
  isConfirmingDelete.value = true;
};

const closeDeleteConfirm = () => {
  isConfirmingDelete.value = false;
};

const handleDelete = async () => {
  if (!project.value) return;
  if (isDeleting.value) return;

  deleteError.value = "";
  isDeleting.value = true;

  try {
    const deleted = await deleteProject(project.value.id);
    if (!deleted) return;

    await router.push("/");
  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : "プロジェクトの削除に失敗しました。";
  } finally {
    isDeleting.value = false;
  }
};

const handleInfoSubmit = () => {
  if (!project.value) return;

  if (!canSaveInfo.value) {
    // HTML制約だけでなく、日付同士の関係もcomputedの結果で止める。
    return;
  }

  const updated = updateProjectInfo(project.value.id, {
    eventName: editEventName.value.trim(),
    title: editTitle.value.trim(),
    startDate: editStartDate.value,
    eventDate: editEventDate.value,
    deadline: editDeadline.value,
    totalPages: editTotalPages.value,
    workProcessId: editWorkProcessId.value,
  });

  if (!updated) {
    return;
  }

  isEditingInfo.value = false;
};

const handleBookSpecSubmit = () => {
  if (!project.value) return;

  const updated = updateBookSpec(project.value.id, {
    totalPages: bookSpecForm.totalPages,
    colorMode: bookSpecForm.colorMode,
    coverPaper: bookSpecForm.coverPaper,
    bodyPaper: bookSpecForm.bodyPaper,
    printer: bookSpecForm.printer,
    printRun: bookSpecForm.printRun,
    budget: bookSpecForm.budget,
    note: bookSpecForm.note,
  });

  if (updated) {
    isEditingBookSpec.value = false;
  }
};

const updatePageStatusWithDailySync = (
  pageNumber: number,
  nextStatus: PageStatus
) => {
  // ページ進捗の変更を、現在選択中の日付の作業ログとして同時に残す。
  updatePageStatus(String(route.params.id), pageNumber, nextStatus, {
    workDate: selectedWorkDateKey.value,
    syncDailyActual: true,
  });
};

const getPageStatusIndex = (status: PageStatus) => {
  return Math.max(0, statuses.value.indexOf(status));
};

const getStatusIndexPercent = (index: number) => {
  if (statuses.value.length <= 1) return 0;

  return Math.round((index / (statuses.value.length - 1)) * 100);
};

const getPageStatusPercent = (status: PageStatus) => {
  return getStatusIndexPercent(getPageStatusIndex(status));
};

const getStatusFromPointerEvent = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  const pointerX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  const ratio = rect.width === 0 ? 0 : pointerX / rect.width;
  // クリック位置を最も近い工程へ丸めることで、バー全体をステップ入力として使う。
  const statusIndex = Math.round(ratio * (statuses.value.length - 1));

  return statuses.value[statusIndex];
};

const handleProgressBarClick = (pageNumber: number, event: MouseEvent) => {
  // キーボード操作から発火したclickはkeydown側で処理済みなので重複更新を避ける。
  if (event.detail === 0) return;

  updatePageStatusWithDailySync(pageNumber, getStatusFromPointerEvent(event));
};

const handleProgressBarKeydown = (
  pageNumber: number,
  currentStatus: PageStatus,
  event: KeyboardEvent
) => {
  const currentIndex = getPageStatusIndex(currentStatus);
  const keyToStatusIndex: Record<string, number> = {
    ArrowLeft: currentIndex - 1,
    ArrowDown: currentIndex - 1,
    ArrowRight: currentIndex + 1,
    ArrowUp: currentIndex + 1,
    Home: 0,
    End: statuses.value.length - 1,
  };
  const nextIndex = keyToStatusIndex[event.key];

  if (nextIndex === undefined) return;

  event.preventDefault();
  // キーボード操作でもスライダーの範囲外へ出ないように丸める。
  const boundedIndex = Math.min(Math.max(nextIndex, 0), statuses.value.length - 1);
  updatePageStatusWithDailySync(pageNumber, statuses.value[boundedIndex]);
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}
</script>
