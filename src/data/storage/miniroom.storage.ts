import { supabase } from "@/lib/supabase";
import { Sticker, MiniRoomTheme } from "@/features/mini-room/types";
import { MINIROOM_THEMES } from "@/features/mini-room/constants";

const miniroomCache = {
  theme: null as MiniRoomTheme | null,
  stickers: null as Sticker[] | null,
};

export const getMiniRoomTheme = async (): Promise<MiniRoomTheme> => {
  if (miniroomCache.theme) return miniroomCache.theme;
  const { data, error } = await supabase
    .from("miniroom_settings")
    .select("theme")
    .eq("id", 1)
    .single();

  const theme =
    MINIROOM_THEMES.find((t) => t.id === data?.theme) ?? MINIROOM_THEMES[0];

  if (!error) miniroomCache.theme = theme;

  return theme;
};

export const setMiniRoomTheme = async (
  themeId: string,
  password: string,
): Promise<boolean> => {
  const { error } = await supabase.rpc("set_miniroom_theme", {
    p_theme: themeId,
    p_password: password,
  });

  if (error) {
    if (error.message.includes("unauthorized")) return false;
    console.error("테마 저장 실패:", error);
    return false;
  }

  miniroomCache.theme =
    MINIROOM_THEMES.find((t) => t.id === themeId) ?? MINIROOM_THEMES[0];
  return true;
};

export const getMiniRoomStickers = async (): Promise<Sticker[]> => {
  if (miniroomCache.stickers) return miniroomCache.stickers;

  const { data, error } = await supabase
    .from("miniroom_stickers")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("스티커 로드 실패:", error);
    return [];
  }

  miniroomCache.stickers = data.map((row) => ({
    id: row.id,
    type: row.type,
    content: row.content,
    x: row.x,
    y: row.y,
    scale: row.scale,
    rotation: row.rotation,
    textStyle: row.text_style ?? "default",
  }));

  return miniroomCache.stickers;
};

export const addMiniRoomSticker = async (
  sticker: Sticker,
  password: string,
): Promise<boolean> => {
  const { error } = await supabase.rpc("add_miniroom_sticker", {
    p_id: sticker.id,
    p_type: sticker.type,
    p_content: sticker.content,
    p_x: sticker.x,
    p_y: sticker.y,
    p_scale: sticker.scale ?? 1,
    p_rotation: sticker.rotation ?? 0,
    p_text_style: sticker.textStyle ?? "default",
    p_password: password,
  });

  if (error) {
    if (error.message.includes("unauthorized")) return false;
    console.error("스티커 추가 실패:", error);
    return false;
  }

  if (miniroomCache.stickers)
    miniroomCache.stickers = [...miniroomCache.stickers, sticker];
  return true;
};

export const updateMiniRoomSticker = async (
  sticker: Sticker,
  password: string,
): Promise<boolean> => {
  const { error } = await supabase.rpc("update_miniroom_sticker", {
    p_id: sticker.id,
    p_x: sticker.x,
    p_y: sticker.y,
    p_scale: sticker.scale ?? 1,
    p_rotation: sticker.rotation ?? 0,
    p_password: password,
  });

  if (error) {
    console.error("스티커 업데이트 실패:", error);
    return false;
  }

  if (miniroomCache.stickers) {
    miniroomCache.stickers = miniroomCache.stickers.map((s) =>
      s.id === sticker.id ? sticker : s,
    );
  }
  return true;
};

export const deleteMiniRoomSticker = async (
  id: string,
  password: string,
): Promise<boolean> => {
  const { error } = await supabase.rpc("delete_miniroom_sticker", {
    p_id: id,
    p_password: password,
  });

  if (error) {
    console.error("스티커 삭제 실패:", error);
    return false;
  }

  if (miniroomCache.stickers) {
    miniroomCache.stickers = miniroomCache.stickers.filter((s) => s.id !== id);
  }
  return true;
};
