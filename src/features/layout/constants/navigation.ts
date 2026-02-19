import { Home, MessageSquare, User } from "lucide-react";
import { Tab } from "../types";
import { CATEGORIES, CATEGORY_ICONS } from "@/shared/constants";

export const NAVIGATION_TABS: Tab[] = [
  { name: "홈", path: "/", icon: Home },
  {
    name: "개발",
    path: `/posts/${CATEGORIES.DEV_LOG}`,
    icon: CATEGORY_ICONS[CATEGORIES.DEV_LOG],
  },
  {
    name: "일상",
    path: `/posts/${CATEGORIES.DAILY}`,
    icon: CATEGORY_ICONS[CATEGORIES.DAILY],
  },
  { name: "방명록", path: "/guestbook", icon: MessageSquare },
  { name: "About", path: "/about", icon: User },
];
