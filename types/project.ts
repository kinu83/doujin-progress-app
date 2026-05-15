export type PageStatus = string;

export type ManuscriptPage = {
  pageNumber: number;
  status: PageStatus;
};

export type DailyWorkEntry = {
  planned: number;
  actual: number;
};

export type WorkLogKind = "pageStatus" | "manualActual" | "legacyActual";

export type WorkLog = {
  id: string;
  projectId: string;
  workDate: string;
  kind: WorkLogKind;
  minutes: number;
  pageNumber?: number;
  fromStatus?: PageStatus;
  toStatus?: PageStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type PrintColorMode = "フルカラー" | "モノクロ";

export type BookSpec = {
  colorMode: PrintColorMode;
  coverPaper: string;
  bodyPaper: string;
  printer: string;
  printRun: number;
  budget: number;
  note: string;
};

export type Project = {
  id: string;
  eventName: string;
  title: string;
  startDate: string;
  eventDate: string;
  deadline: string;
  totalPages: number;
  workProcessId: string;
  workProcessName: string;
  workProcessSteps: import("~/types/settings").WorkProcessStep[];
  bookSpec: BookSpec;
  pages: ManuscriptPage[];
  dailyWorkEntries: Record<string, DailyWorkEntry>;
  workLogs: WorkLog[];
  createdAt: string;
};
