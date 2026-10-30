<template>
  <section class="mt-8 grid gap-4">
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

      <p
        v-if="user?.isAnonymous"
        class="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-black leading-6 text-amber-800"
      >
        お試し利用中です。現在のお試しデータはGoogleアカウントへ引き継げません。
      </p>
      <button
        type="button"
        class="mt-5 w-fit rounded-xl border-2 border-[#263236] bg-white px-4 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isSignOutLoading"
        @click="handleSignOut"
      >
        {{ signOutButtonLabel }}
      </button>
    </div>

    <p
      v-if="accountMessage"
      class="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"
    >
      {{ accountMessage }}
    </p>
  </section>
</template>

<script setup lang="ts">
const {
  user,
  isAuthReady,
  signOut,
} = useFirebaseAuth();

const accountMessage = ref("");
const isSignOutLoading = ref(false);

const isGoogleLinked = computed(() => {
  return user.value?.providerData.some((provider) => provider.providerId === "google.com") ?? false;
});

const accountName = computed(() => {
  return user.value?.displayName || user.value?.email || (user.value?.isAnonymous ? "お試しユーザー" : "未ログイン");
});

const accountStatusLabel = computed(() => {
  if (!isAuthReady.value) return "認証状態を確認しています。";
  if (isGoogleLinked.value) return user.value?.email ? `Googleログイン中: ${user.value.email}` : "Googleログイン中です。";
  if (user.value?.isAnonymous) return "ユーザー名によるお試し利用中です。";
  return "未ログインです。";
});

const signOutButtonLabel = computed(() => {
  return isSignOutLoading.value ? "ログアウト中..." : "ログアウト";
});

const handleSignOut = async () => {
  isSignOutLoading.value = true;
  accountMessage.value = "";

  try {
    await signOut();
  } catch {
    accountMessage.value = "";
  } finally {
    isSignOutLoading.value = false;
  }
};
</script>
