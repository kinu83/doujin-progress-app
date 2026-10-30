export const SETTING_SECTIONS = [
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
    id: "account",
    title: "アカウント",
    description: "ログイン状態",
    detail: "現在のログイン方法と接続状態を確認します。",
    available: true,
  },
  {
    id: "legal",
    title: "規約・ポリシー",
    description: "利用規約とお問い合わせ",
    detail: "利用規約・プライバシーポリシーの確認と、お問い合わせができます。",
    available: true,
  },
] as const;

export type SettingSection = (typeof SETTING_SECTIONS)[number];
export type SettingSectionId = SettingSection["id"];
