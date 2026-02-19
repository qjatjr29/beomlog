import { MiniRoomTheme, MinimeOption, TextStyle } from "../types";
import MINIME_DEVELOPER from "@/assets/minime/developer.png";
import MINIME_POOH from "@/assets/minime/pooh.png";
import MINIME_MAN from "@/assets/minime/man.png";
import MINIME_GIRL from "@/assets/minime/girl.png";
import MINIME_GOJO from "@/assets/minime/gojo.png";
import MINIME_SOCCER from "@/assets/minime/soccer.png";
import MINIME_MAENGGU from "@/assets/minime/maenggu.png";
import MINIME_STONE_MAENGGU from "@/assets/minime/stone_maenggu.png";
import MINIME_RACOON from "@/assets/minime/racoon.webp";
import MINIME_MINION from "@/assets/minime/minion.png";
import BG_CRAYON from "@/assets/miniroom/crayon.jpeg";
import BG_MAC from "@/assets/miniroom/mac.png";
import BG_WINDOW from "@/assets/miniroom/window.jpeg";
import BG_ANIMAL_FOREST from "@/assets/miniroom/animal-forest.png";
import ICON_AWS from "@/assets/icons/AWS-Cloud-logo.svg";

export const DEFAULT_SCALE = 1;
export const MIN_SCALE = 0.3;
export const MAX_SCALE = 3;
export const SCALE_STEP = 0.1;

export const TECH_BADGE_OPTIONS = [
  // 언어
  {
    id: "typescript",
    label: "TypeScript",
    color: "#3178c6",
    icon: "https://cdn.simpleicons.org/typescript/ffffff",
  },
  {
    id: "javascript",
    label: "JavaScript",
    color: "#f7df1e",
    icon: "https://cdn.simpleicons.org/javascript/000000",
  },
  {
    id: "python",
    label: "Python",
    color: "#3776ab",
    icon: "https://cdn.simpleicons.org/python/ffffff",
  },
  {
    id: "rust",
    label: "Rust",
    color: "#ce422b",
    icon: "https://cdn.simpleicons.org/rust/ffffff",
  },
  {
    id: "go",
    label: "Go",
    color: "#00add8",
    icon: "https://cdn.simpleicons.org/go/ffffff",
  },
  {
    id: "java",
    label: "Java",
    color: "#007396",
    icon: "https://cdn.simpleicons.org/openjdk/ffffff",
  },
  // 프레임워크
  {
    id: "react",
    label: "React",
    color: "#20232a",
    icon: "https://cdn.simpleicons.org/react/61dafb",
  },
  {
    id: "nextjs",
    label: "Next.js",
    color: "#000000",
    icon: "https://cdn.simpleicons.org/nextdotjs/ffffff",
  },
  {
    id: "nestjs",
    label: "NestJS",
    color: "#e0234e",
    icon: "https://cdn.simpleicons.org/nestjs/ffffff",
  },
  {
    id: "spring",
    label: "Spring",
    color: "#6db33f",
    icon: "https://cdn.simpleicons.org/spring/ffffff",
  },
  // 인프라
  {
    id: "docker",
    label: "Docker",
    color: "#2496ed",
    icon: "https://cdn.simpleicons.org/docker/ffffff",
  },
  {
    id: "kubernetes",
    label: "K8s",
    color: "#326ce5",
    icon: "https://cdn.simpleicons.org/kubernetes/ffffff",
  },
  {
    id: "aws",
    label: "AWS",
    color: "#232f3e",
    icon: ICON_AWS,
  },
  {
    id: "github",
    label: "GitHub",
    color: "#181717",
    icon: "https://cdn.simpleicons.org/github/ffffff",
  },
  // DB
  {
    id: "postgresql",
    label: "PostgreSQL",
    color: "#336791",
    icon: "https://cdn.simpleicons.org/postgresql/ffffff",
  },
  {
    id: "redis",
    label: "Redis",
    color: "#dc382d",
    icon: "https://cdn.simpleicons.org/redis/ffffff",
  },
  {
    id: "mongodb",
    label: "MongoDB",
    color: "#47a248",
    icon: "https://cdn.simpleicons.org/mongodb/ffffff",
  },
];

export const EMOJI_OPTIONS = [
  "⭐",
  "💖",
  "✨",
  "🌈",
  "🎵",
  "☕",
  "📚",
  "🚀",
  "💡",
  "🔥",
  "🍀",
  "☁️",
  "🌙",
  "🎮",
  "🎸",
  "🏆",
  "🧩",
  "🍕",
];

export const MINIME_OPTIONS: MinimeOption[] = [
  { id: "man", url: MINIME_MAN, name: "남자" },
  { id: "girl", url: MINIME_GIRL, name: "여자" },
  { id: "dev", url: MINIME_DEVELOPER, name: "개발자" },
  { id: "gojo", url: MINIME_GOJO, name: "고조사토루" },
  { id: "racoon", url: MINIME_RACOON, name: "동물의 숲 너굴" },
  { id: "minion", url: MINIME_MINION, name: "미니언(밥)" },
  { id: "maenggu", url: MINIME_MAENGGU, name: "맹구" },
  { id: "stone_maenggu", url: MINIME_STONE_MAENGGU, name: "돌 줍는 맹구" },
  { id: "pooh", url: MINIME_POOH, name: "푸" },
  { id: "soccer", url: MINIME_SOCCER, name: "축구" },
];

export const MINIROOM_THEMES: MiniRoomTheme[] = [
  {
    id: "macbook",
    name: "맥북 바탕화면",
    gradient: "from-[#1c2b3a] via-[#2d1b4e] to-[#0a1628]",
    bgImage: BG_MAC,
  },
  {
    id: "crayon",
    name: "짱구 테마",
    gradient: "from-[#FDE68A] via-[#FACC15] to-[#F59E0B]",
    bgImage: BG_CRAYON,
  },
  {
    id: "windows",
    name: "윈도우 기본 배경화면",
    gradient: "from-[#0078D4] via-[#2B88D8] to-[#00B7F0]",
    bgImage: BG_WINDOW,
  },
  {
    id: "animal-forest",
    name: "동물의 숲",
    gradient: "from-[#A7F3D0] via-[#6EE7B7] to-[#10B981]",
    bgImage: BG_ANIMAL_FOREST,
  },
];

export const TEXT_STYLES: {
  style: TextStyle;
  label: string;
  preview: string;
}[] = [
  { style: "default", label: "기본", preview: "[ 안녕 ]" },
  { style: "talk", label: "말풍선", preview: "💬 안녕" },
  { style: "cloud", label: "구름", preview: "☁️ 안녕" },
];
