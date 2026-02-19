import {
  Laptop,
  Coffee,
  Plane,
  LucideIcon,
  BookOpen,
  PenTool,
} from "lucide-react";

export const POSTS_PER_PAGE = 5;

export const CATEGORIES = {
  DEV_LOG: "개발",
  DAILY: "일상",
  TRAVEL: "여행",
  STUDY: "학습",
  TIL: "TIL",
} as const;

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  [CATEGORIES.DEV_LOG]: Laptop,
  [CATEGORIES.DAILY]: Coffee,
  [CATEGORIES.TRAVEL]: Plane,
  [CATEGORIES.STUDY]: BookOpen,
  [CATEGORIES.TIL]: PenTool,
};

export const CATEGORY_LABELS: Record<string, string> = {
  [CATEGORIES.DEV_LOG]: "개발",
  [CATEGORIES.DAILY]: "일상",
  [CATEGORIES.TRAVEL]: "여행",
  [CATEGORIES.STUDY]: "학습",
  [CATEGORIES.TIL]: "오늘 배운 것",
};
