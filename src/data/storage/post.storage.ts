import { supabase } from "@/lib/supabase";
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
  const today = new Date().toISOString().split("T")[0];
  const cacheKey = `postView_${postId}_${today}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    return parseInt(cached);
  }

  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipResponse.json();
    const ipHash = await hashIpString(ip);

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
