import { useState, useCallback, useEffect } from "react";
import { MiniRoomTheme } from "../types";
import { MINIROOM_THEMES } from "../constants";
import {
  getMiniRoomTheme,
  setMiniRoomTheme,
} from "@/data/storage/miniroom.storage";
import { useAdmin } from "@/contexts/AdminContext";

export const useMiniRoomTheme = () => {
  const { adminPassword } = useAdmin();
  const [currentTheme, setCurrentTheme] = useState<MiniRoomTheme | null>(null);

  useEffect(() => {
    getMiniRoomTheme().then(setCurrentTheme);
  }, []);

  const changeTheme = useCallback(
    async (themeId: string) => {
      const theme =
        MINIROOM_THEMES.find((t) => t.id === themeId) ?? MINIROOM_THEMES[0];
      setCurrentTheme(theme);
      await setMiniRoomTheme(themeId, adminPassword);
    },
    [adminPassword],
  );

  return { currentTheme, changeTheme };
};
