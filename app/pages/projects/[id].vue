<template>
  <main class="min-h-screen bg-[#edf6fa] px-6 py-8 text-[#263236]">
    <div class="mx-auto max-w-5xl">
      <div class="flex flex-wrap items-center gap-3">
        <UiBackLink />
        <NuxtLink
          to="/calendar"
          aria-label="カレンダーを表示"
          title="カレンダー"
          class="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#263236] bg-white text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] hover:shadow-[4px_4px_0_rgba(38,50,54,0.22)]"
        >
          <img src="/icon/calendar.svg" alt="" aria-hidden="true" class="h-5 w-5">
        </NuxtLink>
      </div>

      <div v-if="project" class="mt-4 grid gap-6">
        <section class="rounded-3xl border-4 border-[#2c8d98] bg-white p-5 shadow-[5px_5px_0_rgba(44,141,152,0.16)] sm:p-8">
          <ProjectDetailHeader
            :project="project"
            @delete="openDeleteConfirm"
            @edit="isEditingInfo = true"
          />
          <ProjectProgressSummary :project="project" />
          <ProjectBookSpecPanel
            :project="project"
            @edit="isEditingBookSpec = true"
          />
        </section>

        <ProjectPageProgressSection
          :project="project"
          :work-date-key="selectedWorkDateKey"
          @change="updatePageStatusWithDailySync"
        />

        <UiConfirmDialog
          :open="isConfirmingDelete"
          tone="danger"
          eyebrow="削除前の確認"
          title="この作品情報を削除しますか？"
          :confirm-label="isDeleting ? '削除中...' : '削除する'"
          :confirm-disabled="isDeleting"
          @confirm="handleDelete"
          @cancel="closeDeleteConfirm"
        >
          <p class="text-sm font-bold leading-6 text-[#263236]/70">
            「{{ project.title }}」とページ別進捗は完全に削除されます。この操作は元に戻せません。
          </p>
          <p
            v-if="deleteError"
            class="mt-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
          >
            {{ deleteError }}
          </p>
        </UiConfirmDialog>

        <ProjectInfoEditDialog
          :open="isEditingInfo"
          :project="project"
          :work-processes="settings.workProcesses"
          @save="handleInfoSave"
          @cancel="isEditingInfo = false"
        />

        <ProjectBookSpecEditDialog
          :open="isEditingBookSpec"
          :project="project"
          @save="handleBookSpecSave"
          @cancel="isEditingBookSpec = false"
        />
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
import { useProjects } from "~/composables/useProjects";
import type { BookSpecInput, ProjectInfoInput } from "~/composables/useProjects";
import type { PageStatus } from "~/types/project";
import { formatDateKey } from "~/utils/planAllocation";

const route = useRoute();
const router = useRouter();
const {
  getProjectById,
  loadProjects,
  deleteProject,
  updatePageStatus,
  updateProjectInfo,
  updateBookSpec,
} = useProjects();
const { settings, loadSettings } = useSettings();

onMounted(() => {
  loadSettings();
  loadProjects();
});

const project = computed(() => getProjectById(String(route.params.id)));
const todayKey = computed(() => formatDateKey(new Date()));
const selectedWorkDateKey = computed(() => {
  const queryValue = Array.isArray(route.query.workDate)
    ? route.query.workDate[0]
    : route.query.workDate;

  // カレンダーから来た日付だけを採用し、直接アクセス時は今日の実績入力にする。
  return isDateKey(queryValue) ? queryValue : todayKey.value;
});

const isEditingInfo = ref(false);
const isEditingBookSpec = ref(false);
const isConfirmingDelete = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");

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

const handleInfoSave = (input: ProjectInfoInput) => {
  if (!project.value) return;

  if (updateProjectInfo(project.value.id, input)) {
    isEditingInfo.value = false;
  }
};

const handleBookSpecSave = (input: BookSpecInput) => {
  if (!project.value) return;

  if (updateBookSpec(project.value.id, input)) {
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

function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
</script>
