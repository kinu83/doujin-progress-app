export type PageStatus =
  | "未着手"
  | "ネーム"
  | "下描き"
  | "ペン入れ"
  | "仕上げ"
  | "完成";

export type ManuscriptPage = {
  pageNumber: number;
  status: PageStatus;
};

export type DailyWorkEntry = {
  planned: number;
  actual: number;
};

export type PrintColorMode = "フルカラー" | "モノクロ";

export type BookSpec = {
  colorMode: PrintColorMode;
  coverPaper: string;
  bodyPaper: string;
  printer: string;
  printRun: number;
  budget: number;
};

export type Project = {
  id: string;
  eventName: string;
  title: string;
  startDate: string;
  eventDate: string;
  deadline: string;
  totalPages: number;
  bookSpec: BookSpec;
  pages: ManuscriptPage[];
  dailyWorkEntries: Record<string, DailyWorkEntry>;
  createdAt: string;
};
