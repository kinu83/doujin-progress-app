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
          ログインして利用を開始
        </p>
      </div>

      <div class="mt-7 grid gap-5">

        <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center  ">

          <form class="mt-4 grid gap-3" @submit.prevent="handleUsernameSignIn">
            <label class="grid gap-2">
            <p class="text-xs font-bold leading-5 text-[#ff4b1f]">
              ※ユーザー名認証では、後からGoogleアカウントへの引き継ぎはできません。
            </p>
              <input
                v-model="username"
                type="text"
                autocomplete="nickname"
                placeholder="ユーザー名（英字）"
                class="rounded-xl border-2 border-[#2c8d98]/40 bg-white px-4 py-3 font-bold text-[#263236] outline-none ring-0 transition focus:border-[#2c8d98]"
              >
            </label>
            <button
              type="submit"
              class="w-full rounded-xl border-2  border-[#2c8d98]/40 bg-white px-5 py-3 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isLoading"
            >
              {{ isUsernameLoading ? "開始中..." : "ユーザー名でお試し利用" }}
            </button>
          </form>
        </div>
        <button
          type="button"
          class="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-[#263236] bg-[#2c8d98] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_rgba(38,50,54,0.28)] transition hover:-translate-y-0.5 hover:bg-[#237984] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading"
          @click="handleGoogleSignIn"
        >
          <span class="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-[#2c8d98]">G</span>
          <span>{{ isGoogleLoading ? "ログイン中..." : "Googleログイン" }}</span>
        </button>

        <p
          v-if="displayError"
          class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
        >
          {{ displayError }}
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const {
  authError,
  signInWithGoogle,
  signInWithUsername,
} = useFirebaseAuth();

const username = ref("");
const localError = ref("");
const isGoogleLoading = ref(false);
const isUsernameLoading = ref(false);

const isLoading = computed(() => isGoogleLoading.value || isUsernameLoading.value);
const displayError = computed(() => localError.value || authError.value);

const handleGoogleSignIn = async () => {
  localError.value = "";
  isGoogleLoading.value = true;

  try {
    await signInWithGoogle();
  } catch {
    localError.value = "";
  } finally {
    isGoogleLoading.value = false;
  }
};

const handleUsernameSignIn = async () => {
  localError.value = "";

  if (!username.value.trim()) {
    localError.value = "ユーザー名を入力してください。";
    return;
  }

  isUsernameLoading.value = true;

  try {
    await signInWithUsername(username.value);
  } catch {
    localError.value = "";
  } finally {
    isUsernameLoading.value = false;
  }
};
</script>
