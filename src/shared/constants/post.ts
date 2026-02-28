import {
  Laptop,
  Coffee,
  LucideIcon,
  BookOpen,
  FolderKanban,
} from "lucide-react";

export const POSTS_PER_PAGE = 5;
export const GRID_POSTS_PER_PAGE = 8;

export const CATEGORIES = {
  PROJECT: "프로젝트",
  DEV: "개발",
  DAILY: "일상",
  BOOK: "책",
} as const;

export const GALLERY_CATEGORIES = new Set([
  CATEGORIES.PROJECT,
  CATEGORIES.BOOK,
]);

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  [CATEGORIES.PROJECT]: FolderKanban,
  [CATEGORIES.DEV]: Laptop,
  [CATEGORIES.DAILY]: Coffee,
  [CATEGORIES.BOOK]: BookOpen,
};

export const CATEGORY_LABELS: Record<string, string> = {
  [CATEGORIES.PROJECT]: "프로젝트",
  [CATEGORIES.DEV]: "개발",
  [CATEGORIES.DAILY]: "일상",
  [CATEGORIES.BOOK]: "책",
};

export const GRID_CATEGORIES = new Set(["일상"]);
