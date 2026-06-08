<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- Firebase Auth はブラウザ側で認証状態を復元するため、クライアント側のみで表示を切り替える -->
    <ClientOnly>
      <!-- 認証状態の確認が終わるまでは、未ログインと判定せず待機画面を表示する -->
      <div
        v-if="!isAuthReady"
        class="grid min-h-screen place-items-center bg-[#edf6fa] px-6 text-center text-sm font-black text-[#263236]"
      >
        認証状態を確認しています...
      </div>

      <!-- ログイン済みの場合は通常ページを表示する -->
      <NuxtPage v-else-if="user" />

      <!-- 未ログインの場合はログイン画面を表示する -->
      <LoginScreen v-else />
      <template #fallback>
        <div class="grid min-h-screen place-items-center bg-[#edf6fa] px-6 text-center text-sm font-black text-[#263236]">
          認証状態を確認しています...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthReady, initAuth } = useFirebaseAuth();

onMounted(() => {
  // SSRではFirebase Authを実行せず、ブラウザで復元された認証状態を確認してから画面を出し分ける。
  void initAuth();
});
</script>
