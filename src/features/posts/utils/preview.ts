import { Post } from "../types";

/**
 * 게시물의 미리보기 텍스트를 추출합니다.
 * excerpt가 있으면 사용
 * content에서 마크다운 제거하고 추출
 */
export const getPostExcerpt = (post: Post, maxLength: number = 150): string => {
  if (post.excerpt) {
    return post.excerpt.length > maxLength
      ? post.excerpt.substring(0, maxLength) + "..."
      : post.excerpt;
  }

  // 마크다운 제거
  const plainText = post.content
    .replace(/```[\s\S]*?```/g, "") // 코드블록 제거
    .replace(/!\[.*?\]\(.*?\)/g, "") // 이미지 제거
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // 링크 제거 (텍스트만 남김)
    .replace(/#{1,6}\s/g, "") // 헤더 마크 제거
    .replace(/[*_~`]/g, "") // 강조 마크 제거
    .replace(/^\s*[-*+]\s/gm, "") // 리스트 마크 제거
    .replace(/^\s*\d+\.\s/gm, "") // 번호 리스트 마크 제거
    .replace(/\n+/g, " ") // 개행을 공백으로
    .trim();

  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + "..."
    : plainText;
};
