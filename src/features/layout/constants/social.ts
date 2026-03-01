import { Github, Instagram, Linkedin, Mail, LucideIcon } from "lucide-react";

interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  hoverColor: string;
  hoverBg: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/qjatjr29",
    icon: Github,
    hoverColor: "group-hover:text-blog-primary",
    hoverBg: "hover:bg-blog-light dark:hover:bg-gray-700",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/in/beomsic",
    icon: Linkedin,
    hoverColor: "group-hover:text-[#0077b5]",
    hoverBg: "hover:bg-[#0077b5]/10",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/beomsic",
    icon: Instagram,
    hoverColor: "group-hover:text-[#e4405f]",
    hoverBg: "hover:bg-[#e4405f]/10",
  },
  {
    id: "email",
    label: "Email",
    href: "mailto:hhqjatjr@gmail.com",
    icon: Mail,
    hoverColor: "hover:text-[#ea4335]",
    hoverBg: "hover:bg-[#ea4335]/10",
  },
];
