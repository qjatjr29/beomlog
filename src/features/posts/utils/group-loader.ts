import groupsJson from "@/assets/posts/groups.json";
import { GroupMeta } from "@/features/posts/types";

export const loadAllGroups = (): GroupMeta[] => {
  return groupsJson as GroupMeta[];
};

export const loadGroupsByCategory = (category: string): GroupMeta[] => {
  return loadAllGroups().filter((g) => g.category === category);
};

export const loadGroupById = (id: string): GroupMeta | null => {
  return loadAllGroups().find((g) => g.id === id) ?? null;
};
