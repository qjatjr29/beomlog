import { supabase } from "@/lib/supabase";
import { getKSTDateString } from "@/shared/utils";
import { hashIpString } from "@/shared/utils/ip.utils";

export const getPostViews = async (postId: string): Promise<number> => {
  const { data } = await supabase
    .from("post_views")
    .select("views")
    .eq("post_id", postId)
    .single();

  return data?.views ?? 0;
};

export const incrementPostViews = async (postId: string): Promise<number> => {
  const today = getKSTDateString();
  const cacheKey = `postView_${postId}_${today}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    return parseInt(cached);
  }

  // 날짜 바뀌면 이전 날짜 캐시 제거
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(`postView_${postId}_`),
  );
  keys.forEach((k) => {
    if (k !== cacheKey) localStorage.removeItem(k);
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    let ipHash: string;
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json", {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const { ip } = await ipResponse.json();
      ipHash = await hashIpString(ip);
    } catch {
      clearTimeout(timeout);
      const sessionKey =
        sessionStorage.getItem("sessionId") ?? crypto.randomUUID();
      sessionStorage.setItem("sessionId", sessionKey);
      ipHash = await hashIpString(sessionKey);
    }

    const { data, error } = await supabase.rpc("increment_post_views", {
      p_post_id: postId,
      p_ip_hash: ipHash,
    });

    if (error) throw error;

    const views = data as number;
    localStorage.setItem(cacheKey, String(views));
    return views;
  } catch (error) {
    console.error("조회수 증가 실패:", error);
    return getPostViews(postId);
  }
};
