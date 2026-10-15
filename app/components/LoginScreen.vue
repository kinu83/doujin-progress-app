<template>
  <main class="grid min-h-screen place-items-center bg-[#edf6fa] px-5 py-8 text-[#263236]">
    <section class="w-full max-w-xl rounded-3xl border-4 border-[#2c8d98] bg-white p-6 shadow-[7px_7px_0_rgba(44,141,152,0.18)] sm:p-8">
      <div class="text-center">
        <img
          src="/logo.png"
          alt="修羅場メーター"
          class="mx-auto h-auto w-full max-w-[300px] drop-shadow-[3px_3px_0_#edf6fa]"
        >
        <p class="mt-5 text-lg font-black text-[#263236]">
          ログインして始める
        </p>
      </div>

      <div class="mt-7 grid gap-5">

        <button
          type="button"
          class="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isGoogleLoading"
          @click="handleGoogleSignIn"
        >
          <span class="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-[#2c8d98]">G</span>
          <span>{{ isGoogleLoading ? "ログイン中..." : "Googleログイン" }}</span>
        </button>
        <p
          v-if="authError"
          class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
        >
          {{ authError }}
        </p>
        <p class="text-center text-xs font-bold leading-5 text-[#263236]/60">
          ログインすると、<NuxtLink to="/terms" class="text-[#2c8d98] underline underline-offset-2 hover:text-[#237984]">利用規約・プライバシーポリシー</NuxtLink>に同意したものとみなします。
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
// Firebase認証の処理はcomposableにまとめ、この画面ではUI状態の管理に集中する
const {
  authError,
  signInWithGoogle,
} = useFirebaseAuth();

const router = useRouter();
const isGoogleLoading = ref(false);

const handleGoogleSignIn = async () => {
  isGoogleLoading.value = true;

  try {
    await signInWithGoogle();
    await router.push("/");
  } catch {
    // 認証エラーはuseFirebaseAuth側のauthErrorで表示する
  } finally {
    isGoogleLoading.value = false;
  }
};
</script>
