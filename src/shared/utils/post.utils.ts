import { FolderOpen } from "lucide-react";
import { CATEGORY_ICONS } from "../constants";

export const getCategoryIcon = (categoryName: string) => {
  return CATEGORY_ICONS[categoryName] ?? FolderOpen;
};
