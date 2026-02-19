import { CSSProperties } from "react";

export const getColorStyle = (color: string): CSSProperties => {
  const colorMap: Record<string, CSSProperties> = {
    gray: { color: "#6b7280" },
    brown: { color: "#b45309" },
    orange: { color: "#ea580c" },
    yellow: { color: "#ca8a04" },
    green: { color: "#16a34a" },
    blue: { color: "#2563eb" },
    purple: { color: "#9333ea" },
    pink: { color: "#db2777" },
    red: { color: "#dc2626" },

    gray_background: {
      backgroundColor: "#f3f4f6",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    brown_background: {
      backgroundColor: "#fef3c7",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    orange_background: {
      backgroundColor: "#ffedd5",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    yellow_background: {
      backgroundColor: "#fef9c3",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    green_background: {
      backgroundColor: "#dcfce7",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    blue_background: {
      backgroundColor: "#dbeafe",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    purple_background: {
      backgroundColor: "#f3e8ff",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    pink_background: {
      backgroundColor: "#fce7f3",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    red_background: {
      backgroundColor: "#fee2e2",
      padding: "2px 6px",
      borderRadius: "4px",
    },
  };

  return colorMap[color] || {};
};
