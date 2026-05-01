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
  progress: number;
};

export type Project = {
  id: string;
  title: string;
  deadline: string;
  totalPages: number;
  pages: ManuscriptPage[];
  createdAt: string;
};
