<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="overlay"
      :class="overlayClass"
      @click.self="emit('close')"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script lang="ts">
type ModalEntry = {
  close: () => void;
};

// 開いているモーダルを開いた順に積み、Escでは一番手前だけを閉じる。
const openModals: ModalEntry[] = [];

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;

  openModals[openModals.length - 1]?.close();
};

const pushModal = (entry: ModalEntry) => {
  if (openModals.includes(entry)) return;
  if (openModals.length === 0) {
    window.addEventListener("keydown", handleEscape);
  }
  openModals.push(entry);
};

const removeModal = (entry: ModalEntry) => {
  const index = openModals.indexOf(entry);
  if (index === -1) return;

  openModals.splice(index, 1);
  if (openModals.length === 0) {
    window.removeEventListener("keydown", handleEscape);
  }
};

const focusableSelector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean;
  // 背景（外枠）のクラス。位置や配色を変えたいときは丸ごと差し替える。
  overlayClass?: string;
}>(), {
  overlayClass: "fixed inset-0 z-50 grid place-items-center bg-[#263236]/50 px-4 py-6",
});

const emit = defineEmits<{
  close: [];
}>();

const overlay = ref<HTMLElement | null>(null);
const entry: ModalEntry = {
  close: () => emit("close"),
};

// data-autofocus の付いた要素を優先し、なければ最初に操作できる要素へフォーカスを移す。
const focusInitialElement = async () => {
  await nextTick();
  const target = overlay.value?.querySelector<HTMLElement>("[data-autofocus]")
    ?? overlay.value?.querySelector<HTMLElement>(focusableSelector);
  target?.focus();
};

const syncOpenState = (isOpen: boolean) => {
  if (isOpen) {
    pushModal(entry);
    focusInitialElement();
  } else {
    removeModal(entry);
  }
};

watch(() => props.open, syncOpenState);

onMounted(() => {
  if (props.open) syncOpenState(true);
});

onBeforeUnmount(() => {
  removeModal(entry);
});
</script>
