export interface FriendBlog {
  name: string; // 표시 이름
  url: string; // 블로그 URL
  description?: string; // 한 줄 소개 (선택)
  emoji?: string; // 아이콘 대신 이모지 (선택)
}

export const FRIEND_BLOGS: FriendBlog[] = [
  //   {
  //     name: "예시 블로그",
  //     url: "https://example.com",
  //     description: "친구의 개발 블로그",
  //     emoji: "🧑‍💻",
  //   },
];
