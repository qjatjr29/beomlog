import { BGMTrack } from "@/features/bgm/types";
import { supabase } from "@/lib/supabase";
const settingCache = {
  statusText: null as string | null,
  playlist: null as BGMTrack[] | null,
  pinnedPostIds: null as string[] | null,
};

const MAX_PINNED_POSTS = 5;

const normalizePinnedPostIds = (postIds: string[]) => {
  return Array.from(new Set(postIds)).slice(0, MAX_PINNED_POSTS);
};

export const getStatusText = async (): Promise<string> => {
  if (settingCache.statusText !== null) return settingCache.statusText;

  const { data, error } = await supabase
    .from("site_settings")
    .select("status_text")
    .eq("id", 1)
    .single();

  const defaultText = "코딩하는 하루 ☕";

  if (error || !data || !data.status_text) {
    return defaultText;
  }

  settingCache.statusText = data.status_text;
  return settingCache.statusText ?? defaultText;
};

export const setStatusText = async (
  text: string,
  password: string,
): Promise<boolean> => {
  const { error } = await supabase.rpc("set_status_text", {
    p_text: text,
    p_password: password,
  });
  if (error) {
    console.error("상태 저장 실패:", error);
    return false;
  }
  settingCache.statusText = text;
  return true;
};

export const getBGMPlaylist = async (): Promise<BGMTrack[]> => {
  if (settingCache.playlist) return settingCache.playlist;

  const { data, error } = await supabase
    .from("bgm_playlist")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("BGM 로드 실패:", error);
    return [];
  }

  settingCache.playlist = data.map((row) => ({
    id: row.id,
    videoId: row.video_id,
    title: row.title,
    orderIndex: row.order_index,
  }));
  return settingCache.playlist;
};

export const addBGMTrack = async (
  track: Omit<BGMTrack, "orderIndex">,
  password: string,
): Promise<boolean> => {
  const orderIndex = settingCache.playlist?.length ?? 0;
  const { error } = await supabase.rpc("add_bgm", {
    p_id: track.id,
    p_video_id: track.videoId,
    p_title: track.title,
    p_order_index: orderIndex,
    p_password: password,
  });
  if (error) {
    console.error("BGM 추가 실패:", error);
    return false;
  }
  if (settingCache.playlist)
    settingCache.playlist = [
      ...settingCache.playlist,
      { ...track, orderIndex },
    ];
  return true;
};

export const updateBGMTrack = async (
  id: string,
  videoId: string,
  title: string,
): Promise<boolean> => {
  const { error } = await supabase.rpc("update_bgm", {
    p_id: id,
    p_video_id: videoId,
    p_title: title,
  });
  if (error) {
    console.error("BGM 수정 실패:", error);
    return false;
  }
  if (settingCache.playlist) {
    settingCache.playlist = settingCache.playlist.map((t) =>
      t.id === id ? { ...t, videoId, title } : t,
    );
  }
  return true;
};

export const updateBGMOrder = async (
  id: string,
  orderIndex: number,
  password: string,
): Promise<boolean> => {
  const { error } = await supabase.rpc("update_bgm_order", {
    p_id: id,
    p_order_index: orderIndex,
    p_password: password,
  });
  if (error) {
    console.error("BGM 순서 변경 실패:", error);
    return false;
  }
  if (settingCache.playlist) {
    settingCache.playlist = settingCache.playlist.map((t) =>
      t.id === id ? { ...t, orderIndex } : t,
    );
  }
  return true;
};

export const deleteBGMTrack = async (
  id: string,
  password: string,
): Promise<boolean> => {
  const { error } = await supabase.rpc("delete_bgm", {
    p_id: id,
    p_password: password,
  });
  if (error) {
    console.error("BGM 삭제 실패:", error);
    return false;
  }
  if (settingCache.playlist)
    settingCache.playlist = settingCache.playlist.filter((t) => t.id !== id);
  return true;
};

// Pinned Post 관련 함수
export const getPinnedPostIds = async (): Promise<string[]> => {
  if (settingCache.pinnedPostIds !== null) return settingCache.pinnedPostIds;

  const { data, error } = await supabase
    .from("site_settings")
    .select("pinned_post_ids")
    .eq("id", 1)
    .single();

  if (!error && data?.pinned_post_ids) {
    settingCache.pinnedPostIds = normalizePinnedPostIds(
      data.pinned_post_ids ?? [],
    );
    return settingCache.pinnedPostIds;
  }

  const fallback = await supabase
    .from("site_settings")
    .select("pinned_post_id")
    .eq("id", 1)
    .single();

  if (!fallback.error && fallback.data?.pinned_post_id) {
    settingCache.pinnedPostIds = [fallback.data.pinned_post_id];
    return settingCache.pinnedPostIds;
  }

  settingCache.pinnedPostIds = [];
  return [];
};

export const setPinnedPostIds = async (
  postIds: string[],
  password: string,
): Promise<{ ok: boolean; errorMessage?: string }> => {
  const normalizedPostIds = normalizePinnedPostIds(postIds);
  const { error } = await supabase.rpc("set_pinned_post_ids", {
    p_post_ids: normalizedPostIds,
    p_password: password,
  });
  if (error) {
    if (normalizedPostIds.length <= 1) {
      const fallback = await supabase.rpc("set_pinned_post", {
        p_post_id: normalizedPostIds[0] ?? null,
        p_password: password,
      });
      if (!fallback.error) {
        settingCache.pinnedPostIds = normalizedPostIds;
        return { ok: true };
      }
    }

    console.error("핀된 게시물 저장 실패:", error);
    return {
      ok: false,
      errorMessage: error.message ?? "핀 저장에 실패했습니다.",
    };
  }
  settingCache.pinnedPostIds = normalizedPostIds;
  return { ok: true };
};

export const getPinnedPostId = async (): Promise<string | null> => {
  const pinnedPostIds = await getPinnedPostIds();
  return pinnedPostIds[0] ?? null;
};

export const setPinnedPostId = async (
  postId: string | null,
  password: string,
): Promise<{ ok: boolean; errorMessage?: string }> => {
  return setPinnedPostIds(postId ? [postId] : [], password);
};
