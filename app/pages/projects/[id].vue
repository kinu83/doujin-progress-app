<template>
  <main class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-5xl">
      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink to="/" class="text-sm font-semibold text-gray-500">
          ← 一覧に戻る
        </NuxtLink>
        <NuxtLink
          to="/calendar"
          aria-label="カレンダーを表示"
          title="カレンダー"
          class="grid h-10 w-10 place-items-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
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
        <section class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-start gap-3">
                <div class="min-w-0 flex-1">
                  <h1 class="break-words text-2xl font-bold text-gray-900">
                    {{ project.title }}
                  </h1>
                  <p v-if="project.startDate" class="mt-1 text-sm text-gray-500">
                    作業開始日 {{ project.startDate }}
                  </p>
                  <p v-else class="mt-1 text-sm text-gray-400">
                    作業開始日は未設定です
                  </p>
                  <p class="mt-2 text-sm text-gray-500">
                    締切 {{ project.deadline }} / {{ project.totalPages }}P
                  </p>
                  <p v-if="project.eventDate" class="mt-1 text-sm text-gray-500">
                    イベント日 {{ project.eventDate }}
                  </p>
                </div>

                <div class="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                    @click="startInfoEdit"
                  >
                    情報を編集
                  </button>
                  <button
                    type="button"
                    class="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-50"
                    @click="openDeleteConfirm"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>

            <div class="shrink-0 text-right">
              <p class="text-3xl font-bold text-gray-900">
                {{ calculateTotalProgress(project.pages) }}%
              </p>
              <p class="text-sm text-gray-500">
                全体進捗
              </p>
            </div>
          </div>

          <div class="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              class="h-full rounded-full bg-gray-900"
              :style="{ width: `${calculateTotalProgress(project.pages)}%` }"
            />
          </div>

          <div
            class="mt-5 rounded-2xl border p-4"
            :class="getCrunchLevelClasses(calculateCrunchLevel(project.pages, project.deadline, project.startDate).tone)"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold">
                  修羅場レベル
                </p>
                <p class="mt-1 text-2xl font-bold">
                  {{ calculateCrunchLevel(project.pages, project.deadline, project.startDate).label }}
                </p>
              </div>
              <div class="flex gap-1" aria-hidden="true">
                <span
                  v-for="level in 5"
                  :key="level"
                  class="h-3 w-3 rounded-full"
                  :class="level <= calculateCrunchLevel(project.pages, project.deadline, project.startDate).intensity ? 'bg-current' : 'bg-current/20'"
                />
              </div>
            </div>
            <p class="mt-2 text-sm leading-6">
              {{ calculateCrunchLevel(project.pages, project.deadline, project.startDate).message }}
            </p>
          </div>

          <div class="mt-5 grid gap-3 text-sm text-gray-600 md:grid-cols-4">
            <div class="rounded-2xl bg-gray-50 p-4">
              残り日数: {{ calculateDaysLeft(project.deadline) }}日
            </div>
            <div class="rounded-2xl bg-gray-50 p-4">
              残作業量: {{ calculateRemainingWork(project.pages) }}
            </div>
            <div
              v-if="!isBeforeStartDate(project.startDate)"
              class="rounded-2xl bg-gray-50 p-4"
            >
              1日あたり必要量: {{ calculateDailyWork(project.pages, project.deadline) }}
            </div>
            <NuxtLink
              to="/calendar"
              class="rounded-2xl bg-gray-50 p-4 transition hover:bg-gray-100"
            >
              今日の作業量: {{ todayDailyEntry.actual }} / 予定 {{ todayDailyEntry.planned }}
            </NuxtLink>
          </div>
        </section>

        <section class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h2 class="text-lg font-bold text-gray-900">
            ページ別進捗
          </h2>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div
              v-for="page in project.pages"
              :key="page.pageNumber"
              class="rounded-2xl border border-gray-200 p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="font-semibold text-gray-900">
                  {{ page.pageNumber }}P
                </p>
                <span class="text-sm font-semibold text-gray-600">
                  {{ page.progress }}%
                </span>
              </div>

              <div class="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  class="h-full rounded-full bg-gray-900"
                  :style="{ width: `${page.progress}%` }"
                />
              </div>

              <select
                :value="page.status"
                class="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                @change="handleStatusChange(page.pageNumber, $event)"
              >
                <option
                  v-for="status in statuses"
                  :key="status"
                  :value="status"
                >
                  {{ status }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <Teleport to="body">
          <div
            v-if="isConfirmingDelete"
            class="fixed inset-0 z-50 grid place-items-center bg-gray-900/50 px-4 py-6"
            @click.self="closeDeleteConfirm"
          >
            <section class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
              <div class="border-b border-red-100 bg-red-50 px-6 py-5">
                <p class="text-sm font-bold text-red-700">
                  削除前の確認
                </p>
                <h2 class="mt-1 text-lg font-bold text-gray-900">
                  この作品情報を削除しますか？
                </h2>
              </div>

              <div class="px-6 py-5">
                <p class="text-sm leading-6 text-gray-600">
                  「{{ project.title }}」とページ別進捗は完全に削除されます。この操作は元に戻せません。
                </p>
              </div>

              <div class="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  class="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                  @click="closeDeleteConfirm"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  class="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                  @click="handleDelete"
                >
                  削除する
                </button>
              </div>
            </section>
          </div>
        </Teleport>

        <Teleport to="body">
          <div
            v-if="isEditingInfo"
            class="fixed inset-0 z-50 grid place-items-center bg-gray-900/50 px-4 py-6"
            @click.self="cancelInfoEdit"
          >
            <form
              class="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200"
              @submit.prevent="handleInfoSubmit"
            >
              <div class="border-b border-gray-200 px-6 py-5">
                <h2 class="text-lg font-bold text-gray-900">
                  プロジェクト情報を編集
                </h2>
                <p class="mt-1 text-sm text-gray-500">
                  作業開始日や締切など、進捗計算に使う情報を更新できます。
                </p>
              </div>

              <div class="grid gap-4 px-6 py-5 md:grid-cols-2">
                <label class="grid gap-2 md:col-span-2">
                  <span class="text-sm font-semibold text-gray-700">タイトル</span>
                  <input
                    v-model="editTitle"
                    type="text"
                    required
                    class="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-semibold text-gray-700">作業開始日</span>
                  <input
                    v-model="editStartDate"
                    type="date"
                    :max="editDeadline"
                    class="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-semibold text-gray-700">締切</span>
                  <input
                    v-model="editDeadline"
                    type="date"
                    required
                    :min="editStartDate || undefined"
                    :max="editEventDate || undefined"
                    class="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-semibold text-gray-700">イベント日</span>
                  <input
                    v-model="editEventDate"
                    type="date"
                    :min="editDeadline || undefined"
                    class="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
                  >
                </label>

                <label class="grid gap-2">
                  <span class="text-sm font-semibold text-gray-700">総ページ数</span>
                  <input
                    v-model.number="editTotalPages"
                    type="number"
                    min="1"
                    required
                    class="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900"
                  >
                </label>

                <p
                  v-if="infoEditError"
                  class="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2"
                >
                  {{ infoEditError }}
                </p>
              </div>

              <div class="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  class="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                  @click="cancelInfoEdit"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  :disabled="!canSaveInfo"
                  class="rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </Teleport>
      </div>

      <div v-else class="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <p class="text-lg font-semibold text-gray-900">
          プロジェクトが見つかりません
        </p>
        <p class="mt-2 text-sm text-gray-500">
          一覧から作成し直してください。
        </p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useProgress } from "~/composables/useProgress";
import { useProjects } from "~/composables/useProjects";
import type { PageStatus } from "~/types/project";

const route = useRoute();
const router = useRouter();
const {
  getProjectById,
  loadProjects,
  deleteProject,
  updatePageStatus,
  updateProjectInfo,
} = useProjects();
const {
  calculateTotalProgress,
  calculateRemainingWork,
  calculateDaysLeft,
  isBeforeStartDate,
  calculateDailyWork,
  calculateCrunchLevel,
} = useProgress();

const statuses: PageStatus[] = [
  "未着手",
  "ネーム",
  "下描き",
  "ペン入れ",
  "仕上げ",
  "完成",
];

onMounted(() => {
  loadProjects();
});

const project = computed(() => getProjectById(String(route.params.id)));
const todayKey = computed(() => formatDateKey(new Date()));
const todayDailyEntry = computed(() => {
  return project.value?.dailyWorkEntries[todayKey.value] ?? {
    planned: 0,
    actual: 0,
  };
});

const isEditingInfo = ref(false);
const isConfirmingDelete = ref(false);
const editTitle = ref("");
const editStartDate = ref("");
const editEventDate = ref("");
const editDeadline = ref("");
const editTotalPages = ref(1);

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

const getCrunchLevelClasses = (tone: string) => {
  const classes: Record<string, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    orange: "border-orange-200 bg-orange-50 text-orange-800",
    red: "border-red-200 bg-red-50 text-red-800",
  };

  return classes[tone] ?? classes.sky;
};

const fillInfoForm = () => {
  if (!project.value) return;

  editTitle.value = project.value.title;
  editStartDate.value = project.value.startDate;
  editEventDate.value = project.value.eventDate;
  editDeadline.value = project.value.deadline;
  editTotalPages.value = project.value.totalPages;
};

const startInfoEdit = () => {
  fillInfoForm();
  isEditingInfo.value = true;
};

const cancelInfoEdit = () => {
  fillInfoForm();
  isEditingInfo.value = false;
};

const openDeleteConfirm = () => {
  isConfirmingDelete.value = true;
};

const closeDeleteConfirm = () => {
  isConfirmingDelete.value = false;
};

const handleDelete = () => {
  if (!project.value) return;

  const deleted = deleteProject(project.value.id);
  if (!deleted) return;

  router.push("/");
};

const handleInfoSubmit = () => {
  if (!project.value) return;

  if (!canSaveInfo.value) {
    return;
  }

  const updated = updateProjectInfo(project.value.id, {
    title: editTitle.value.trim(),
    startDate: editStartDate.value,
    eventDate: editEventDate.value,
    deadline: editDeadline.value,
    totalPages: editTotalPages.value,
  });

  if (!updated) {
    return;
  }

  isEditingInfo.value = false;
};

const handleStatusChange = (pageNumber: number, event: Event) => {
  const nextStatus = (event.target as HTMLSelectElement).value as PageStatus;
  updatePageStatus(String(route.params.id), pageNumber, nextStatus, {
    workDate: todayKey.value,
    syncDailyActual: true,
  });
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
</script>
