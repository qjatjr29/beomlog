import { Home, MessageSquare, User } from "lucide-react";
import { Tab } from "../types";
import { CATEGORIES, CATEGORY_ICONS } from "@/shared/constants";

export const NAVIGATION_TABS: Tab[] = [
  { name: "홈", path: "/", icon: Home },
  { name: "프로필", path: "/profile", icon: User },
  {
    name: CATEGORIES.DEV,
    path: `/posts/${CATEGORIES.DEV}`,
    icon: CATEGORY_ICONS[CATEGORIES.DEV],
  },
  {
    name: CATEGORIES.PROJECT,
    path: `/posts/${CATEGORIES.PROJECT}`,
    icon: CATEGORY_ICONS[CATEGORIES.PROJECT],
  },
  {
    name: CATEGORIES.DAILY,
    path: `/posts/${CATEGORIES.DAILY}`,
    icon: CATEGORY_ICONS[CATEGORIES.DAILY],
  },
  {
    name: CATEGORIES.BOOK,
    path: `/posts/${CATEGORIES.BOOK}`,
    icon: CATEGORY_ICONS[CATEGORIES.BOOK],
  },
  { name: "방명록", path: "/guestbook", icon: MessageSquare },
];

export const MOBILE_TABS = ["홈", "개발", "일상", "방명록"];
