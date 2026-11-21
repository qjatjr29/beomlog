import { FolderOpen } from "lucide-react";
import { CATEGORY_ICONS } from "../constants";

export const getCategoryIcon = (categoryName: string) => {
  return CATEGORY_ICONS[categoryName] ?? FolderOpen;
};

export const sanitizeExcerptPreview = (text?: string): string => {
  if (!text) return "";

  return text
    .replace(/:::\s*callout\s*/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/[#>*_~`\-]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};
