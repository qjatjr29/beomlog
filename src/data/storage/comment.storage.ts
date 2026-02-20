import { Comment } from "@/features/comment/types";
import { supabase } from "@/lib/supabase";

export type DeleteCommentResult =
  | { success: true }
  | { success: false; reason: "wrong_password" | "not_found" | "server_error" };

export const getComments = async (postId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("댓글 로드 실패:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    postId: row.post_id,
    author: row.author,
    password: row.password,
    content: row.content,
    createdAt: row.created_at,
    isAdmin: row.is_admin ?? false,
  }));
};

export const saveComment = async (comment: Comment): Promise<boolean> => {
  const { error } = await supabase.from("comments").insert({
    id: comment.id,
    post_id: comment.postId,
    author: comment.author,
    password: comment.password,
    content: comment.content,
    created_at: comment.createdAt,
    is_admin: comment.isAdmin ?? false,
  });

  if (error) {
    console.error("댓글 저장 실패:", error);
    return false;
  }

  return true;
};

export const deleteComment = async (
  commentId: string,
  enteredPassword: string,
): Promise<DeleteCommentResult> => {
  // 비밀번호 - 서버(RPC)에서 검증
  const { error } = await supabase.rpc("delete_comment", {
    p_comment_id: commentId,
    p_password: enteredPassword,
  });

  if (error) {
    if (error.message.includes("not_found"))
      return { success: false, reason: "not_found" };
    if (error.message.includes("unauthorized"))
      return { success: false, reason: "wrong_password" };
    console.error("댓글 삭제 실패:", error);
    return { success: false, reason: "server_error" };
  }

  return { success: true };
};

export const getGuestbookCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", "guestbook");

  if (error) return 0;
  return count ?? 0;
};
