<template>
  <main class="min-h-screen bg-[#edf6fa] px-5 py-8 text-[#263236]">
    <div class="mx-auto max-w-3xl">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-xl border-2 border-[#263236] bg-white px-4 py-2 text-sm font-black text-[#263236] shadow-[3px_3px_0_rgba(38,50,54,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f7fcfd]"
      >
        ← トップへ戻る
      </NuxtLink>

      <article
        v-for="document in documents"
        :id="document.id"
        :key="document.id"
        class="mt-6 rounded-3xl border-4 border-[#2c8d98] bg-white p-6 shadow-[5px_5px_0_rgba(44,141,152,0.16)] sm:p-8"
      >
        <h1 class="text-2xl font-black text-[#263236]">
          {{ document.title }}
        </h1>
        <p class="mt-4 text-sm font-bold leading-7 text-[#263236]/80">
          {{ document.lead }}
        </p>

        <section
          v-for="section in document.sections"
          :key="section.title"
          class="mt-7"
        >
          <h2 class="border-l-4 border-[#2c8d98] pl-3 text-base font-black text-[#263236]">
            {{ section.title }}
          </h2>
          <p
            v-for="paragraph in section.paragraphs"
            :key="paragraph"
            class="mt-3 text-sm font-bold leading-7 text-[#263236]/80"
          >
            {{ paragraph }}
          </p>
        </section>

        <section class="mt-7">
          <h2 class="border-l-4 border-[#2c8d98] pl-3 text-base font-black text-[#263236]">
            お問い合わせ
          </h2>
          <p class="mt-3 text-sm font-bold leading-7 text-[#263236]/80">
            {{ document.contactLead }}
          </p>
          <a
            v-if="CONTACT_FORM_URL"
            :href="CONTACT_FORM_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-block text-sm font-black text-[#2c8d98] underline underline-offset-4 hover:text-[#237984]"
          >
            お問い合わせフォーム
          </a>
          <p
            v-else
            class="mt-2 text-sm font-bold text-[#263236]/60"
          >
            お問い合わせフォームは準備中です。
          </p>
        </section>
      </article>

      <p class="mt-6 text-right text-xs font-bold text-[#263236]/60">
        制定日：{{ LEGAL_ENACTED_AT }}　運営：{{ OPERATOR_NAME }}
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  CONTACT_FORM_URL,
  LEGAL_ENACTED_AT,
  OPERATOR_NAME,
  SERVICE_NAME,
} from "~/constants/legal";

// ログイン前でも内容を確認できるよう、認証不要のページとして扱う
definePageMeta({
  public: true,
});

useHead({
  title: `利用規約・プライバシーポリシー | ${SERVICE_NAME}`,
});

type LegalDocument = {
  id: string;
  title: string;
  lead: string;
  contactLead: string;
  sections: { title: string; paragraphs: string[] }[];
};

const documents: LegalDocument[] = [
  {
    id: "terms",
    title: "利用規約",
    lead: `本利用規約は、「${SERVICE_NAME}」（以下「本サービス」）の利用条件を定めるものです。利用者は、本サービスにログインした時点で本規約に同意したものとみなします。`,
    contactLead: "本サービスに関するお問い合わせは、以下のフォームにて受け付けています。",
    sections: [
      {
        title: "本サービスについて",
        paragraphs: [
          "本サービスは、同人誌等の原稿制作における進捗を、締切日から逆算して管理するための個人が運営するツールです。即売会の主催者、印刷所その他の団体とは関係ありません。",
        ],
      },
      {
        title: "アカウント",
        paragraphs: [
          "本サービスはGoogleアカウントによるログインを必要とします。アカウントの管理は、利用者ご自身の責任において行ってください。",
        ],
      },
      {
        title: "計算結果の取り扱い",
        paragraphs: [
          "修羅場メーターや必要作業時間などの表示は、利用者が入力した内容に基づく目安であり、締切までの完成を保証するものではありません。入稿締切や印刷仕様については、印刷所・主催者の公式情報をご確認ください。",
        ],
      },
      {
        title: "入力内容の権利",
        paragraphs: [
          "利用者が入力した内容に関する権利は、利用者に帰属します。運営者がこれを公開することはありません。",
        ],
      },
      {
        title: "禁止事項",
        paragraphs: [
          "不正アクセス、他人のアカウントの利用、本サービスに過度な負荷をかける行為、その他法令または公序良俗に反する行為を禁止します。",
        ],
      },
      {
        title: "サービスの変更・終了",
        paragraphs: [
          "本サービスは、予告なく内容の変更、一時停止または終了を行う場合があります。終了する場合は、可能な限り事前に本サービス上でお知らせします。",
        ],
      },
      {
        title: "免責",
        paragraphs: [
          "運営者は、データの消失その他本サービスの利用に関して生じた損害について、責任を負いません。",
        ],
      },
      {
        title: "規約の変更・準拠法",
        paragraphs: [
          "本規約は必要に応じて変更することがあり、重要な変更は本サービス上でお知らせします。本規約は日本法に準拠します。",
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "プライバシーポリシー",
    lead: "本プライバシーポリシーは、本サービスにおける利用者情報の取り扱いについて定めるものです。",
    contactLead: "情報の開示・削除のご依頼は、以下のフォームにて受け付けています。",
    sections: [
      {
        title: "取得する情報",
        paragraphs: [
          "本サービスは、Googleアカウントでのログイン時に提供されるアカウント情報（メールアドレス、表示名等）と、利用者が入力した原稿の進捗に関する情報を取得します。",
        ],
      },
      {
        title: "利用目的",
        paragraphs: [
          "取得した情報は、本人確認、進捗データの保存・表示、お問い合わせへの対応、および本サービスの運営に必要な範囲でのみ利用します。メールアドレスを広告やお知らせの送付に利用することはありません。",
        ],
      },
      {
        title: "情報の管理",
        paragraphs: [
          "利用者の情報は、他の利用者から閲覧できないよう管理します。運営者は、お問い合わせへの対応、障害対応、法令に基づく対応に必要な場合を除き、利用者の情報を閲覧しません。",
        ],
      },
      {
        title: "アクセス解析・広告",
        paragraphs: [
          "本サービスでは、アクセス解析や広告を目的としたトラッキングは行っていません。",
        ],
      },
      {
        title: "外部サービスの利用",
        paragraphs: [
          "本サービスは、ログインおよびデータの保管にGoogle LLCが提供するFirebaseを利用しています。",
        ],
      },
      {
        title: "第三者への提供",
        paragraphs: [
          "法令に基づく場合を除き、利用者の情報を第三者に提供することはありません。",
        ],
      },
      {
        title: "情報の削除",
        paragraphs: [
          "作品のデータは、本サービス上で削除できます。アカウントに関するすべての情報の削除をご希望の場合は、お問い合わせフォームよりご連絡ください。",
        ],
      },
    ],
  },
];
</script>
