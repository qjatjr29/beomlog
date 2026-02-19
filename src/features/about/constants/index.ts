import { Github, Instagram, Linkedin, Mail, Notebook } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/qjatjr29",
    icon: Github,
    bgColor: "bg-gray-800",
    hoverColor: "hover:bg-gray-700",
  },
  {
    id: "email",
    label: "Email",
    href: "mailto:hhqjatjr@gmail.com",
    icon: Mail,
    bgColor: "bg-[#444444]",
    hoverColor: "hover:bg-[#333333]",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/beomsic",
    icon: Instagram,
    bgColor: "bg-[#E1306C]",
    hoverColor: "hover:bg-[#c12a5b]",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/in/beomsic",
    icon: Linkedin,
    bgColor: "bg-[#0077B5]",
    hoverColor: "hover:bg-[#005e8d]",
  },
  {
    id: "tistory",
    label: "Tistory",
    href: "https://beomsic.tistory.com",
    icon: Notebook,
    bgColor: "bg-[#EB531F]",
    hoverColor: "hover:bg-[#d44a1b]",
  },
];

export const TECH_STACKS = [
  {
    category: "Backend",
    skills: [
      { name: "Java", isPrimary: true },
      { name: "Spring Boot", isPrimary: true },
      { name: "NestJS", isPrimary: true },
      { name: "TypeScript", isPrimary: false },
      { name: "Python", isPrimary: false },
      { name: "FastAPI", isPrimary: false },
    ],
  },
  {
    category: "Frontend",
    skills: [
      { name: "React", isPrimary: false },
      { name: "TypeScript", isPrimary: false },
      { name: "Tailwind CSS", isPrimary: false },
    ],
  },
  {
    category: "DB",
    skills: [
      { name: "MySQL", isPrimary: true },
      { name: "PostgreSQL", isPrimary: true },
      { name: "Redis", isPrimary: false },
      { name: "Elasticsearch", isPrimary: false },
    ],
  },
  {
    category: "Infra",
    skills: [
      { name: "AWS", isPrimary: true },
      { name: "Docker", isPrimary: true },
      { name: "GitHub Actions", isPrimary: false },
      { name: "Nginx", isPrimary: false },
    ],
  },
  {
    category: "Community & Tools",
    skills: [
      { name: "Git", isPrimary: true },
      { name: "GitHub", isPrimary: true },
      { name: "Jira", isPrimary: false },
      { name: "Slack", isPrimary: false },
      { name: "Notion", isPrimary: true },
    ],
  },
];

export const EXPERIENCES = [
  {
    company: "🥕 당근마켓",
    team: "데이터 가치화팀",
    role: "Software Engineer, Backend Developer (Intern)",
    period: "2024.07 - 2024.10",
    descriptions: ["사내 지표 데이터 대시보드 서비스 유지보수 및 성능 개선"],
  },
];

export const EDUCATIONS = [
  {
    school: "네이버 부스트캠프 웹·모바일 10기",
    major: "웹 풀스택 과정",
    period: "2025.06 - 2026.02",
    descriptions: [
      "CS 기초 기반 문제 정의 및 설계, 현업 개발자 코드 리뷰 수행",
      "클라이언트~서버 전반의 동작 원리 이해 및 팀 협업 서비스 개발",
    ],
  },
  {
    school: "AUSG (대학생 IT 연합 동아리)",
    major: "6기",
    period: "2022.07 - 현재",
    descriptions: [
      "현업자 및 대학생 발표 세션 참여 및 네트워킹, 기술 스터디 진행",
    ],
  },
  {
    school: "프로그래머스 백엔드 데브코스 2기",
    major: "Java / Spring 과정",
    period: "2022.03 - 2022.08",
    descriptions: [
      "미션 기반 Java/Spring 교육 및 페어 프로그래밍 경험",
      "멘토링 및 팀원 간의 적극적인 코드 리뷰 참여",
    ],
  },
  {
    school: "경희대학교",
    major: "컴퓨터공학과 졸업",
    period: "2017.03 - 2023.02",
    descriptions: ["소프트웨어융합대학 학사"],
  },
];

export const AWARDS = [
  {
    title: "한국 컴퓨터 종합 학술대회(KCC2022) 발표",
    organization: "한국 정보 과학회",
    date: "2022.06",
    description: "YOLO 모델을 이용한 동영상 하이라이트 추출기 논문",
  },
  {
    title: "경희대학교 해커톤 'khuthon' 대상 수상",
    organization: "경희대학교",
    date: "2021.11",
    description:
      "OpenCV를 통해 사용자가 눈을 감고 있는지 주기적으로 측정 및 판단 / Firebase Cloud Messaging을 이용해 push 알림 기능 구현",
  },
];

// export const INTERESTS = ["웹 개발", "새로운 기술", "음악 감상", "독서"];
