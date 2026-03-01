import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface Tab {
  name: string;
  path: string;
  icon: LucideIcon;
}

export interface LayoutProps {
  children: ReactNode;
}

export interface FriendBlog {
  name: string;
  url: string;
  description?: string;
  emoji?: string;
}
