<template>
  <main class="min-h-screen bg-gray-50 px-6 py-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            同人原稿進捗管理
          </h1>
          <p class="mt-2 text-sm text-gray-600">
            締切から逆算して、今日必要な作業量を確認できます。
          </p>
        </div>

        <NuxtLink
          to="/projects/new"
          class="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white"
        >
          新規作成
        </NuxtLink>
      </div>

      <p class="text-gray-500">
        ここにプロジェクト一覧を表示します。
      </p>
    </div>
  </main>
</template>