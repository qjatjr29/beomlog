export interface Sticker {
  id: string;
  type: StickerType;
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  textStyle?: TextStyle;
}

export type StickerType = "emoji" | "text" | "minime" | "badge" | "speech";

export type TextStyle = "default" | "cloud" | "talk";

export interface TechBadge {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface MiniRoomTheme {
  id: string;
  name: string;
  gradient: string;
  pattern?: string;
  bgImage: string;
}

export interface MinimeOption {
  id: string;
  url: string;
  name: string;
}

export interface MiniRoomProps {
  isAdminMode: boolean;
  onAdminToggle: (password: string) => void;
}

export interface AdminControlsProps {
  showEmojiPicker: boolean;
  showMinimiPicker: boolean;
  showTextInput: boolean;
  showThemePicker: boolean;
  showBadgePicker: boolean;
  onToggleBadgePicker: () => void;
  onAddBadge: (badge: TechBadge) => void;
  textInput: string;
  onToggleEmojiPicker: () => void;
  onToggleMinimiPicker: () => void;
  onToggleTextInput: () => void;
  onToggleThemePicker: () => void;
  onTextInputChange: (value: string) => void;
  onAddEmoji: (emoji: string) => void;
  onAddMinime: (minime: MinimeOption) => void;
  onAddText: (textStyle: TextStyle) => void;
  onChangeTheme: (themeId: string) => void;
  currentTheme: MiniRoomTheme;
}

export interface StickerItemProps {
  sticker: Sticker;
  isAdminMode: boolean;
  isDragging: boolean;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  onRotateStart: (e: React.MouseEvent) => void;
}
