export interface FriendBlog {
  name: string; // 표시 이름
  url: string; // 블로그 URL
  description?: string; // 한 줄 소개 (선택)
  emoji?: string;
}

export const FRIEND_BLOGS: FriendBlog[] = [
  {
    name: "동호의 블로그",
    url: "https://dongho-blog.kro.kr/",
    description: "백엔드 개발자 장동호입니다.",
  },
  {
    name: "Rocky의 블로그",
    url: "https://donggyun.life/",
    description: "Rocky의 블로그에 오신 것을 환영합니다.",
  },
  {
    name: "HoonDong_K",
    url: "https://velog.io/@d159123/posts",
    description: "도움이 될 수 있는 개발자",
  },
];
