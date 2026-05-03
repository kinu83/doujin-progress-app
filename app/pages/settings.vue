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
          <button
            v-for="section in settingSections"
            :key="section.id"
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
        </aside>

        <section class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
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
              <span class="text-sm font-semibold text-gray-700">1工程あたりの作業時間（分）</span>
              <input
                v-model.number="defaultStepMinutes"
                type="number"
                min="1"
                required
                class="rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-gray-900"
              >
              <span class="text-xs font-semibold text-gray-500">
                ネーム、下描き、ペン入れ、仕上げ、完成までの各工程に使われます。
              </span>
            </label>

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
                @click="handleReset"
              >
                初期値に戻す
              </button>
            </div>
          </form>

          <div
            v-else
            class="mt-8 rounded-2xl border border-dashed border-gray-300 p-6 text-sm font-semibold text-gray-500"
          >
            この設定はまだ準備中です。
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const { settings, loadSettings, saveSettings, resetSettings } = useSettings();

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
    id: "profile",
    title: "プロフィール",
    description: "ユーザー情報",
    detail: "名前やプロフィール表示の設定を追加予定です。",
    available: false,
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

const defaultStepMinutes = ref(settings.value.defaultStepMinutes);
const defaultTotalPages = ref(settings.value.defaultTotalPages);
const savedMessage = ref("");

const syncForm = () => {
  defaultStepMinutes.value = settings.value.defaultStepMinutes;
  defaultTotalPages.value = settings.value.defaultTotalPages;
};

onMounted(() => {
  loadSettings();
  syncForm();
});

const handleSubmit = () => {
  saveSettings({
    defaultStepMinutes: defaultStepMinutes.value,
    defaultTotalPages: defaultTotalPages.value,
  });
  syncForm();
  savedMessage.value = "設定を保存しました。";
};

const handleReset = () => {
  resetSettings();
  syncForm();
  savedMessage.value = "初期値に戻しました。";
};
</script>
