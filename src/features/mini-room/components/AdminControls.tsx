import { Sparkles, Type, Palette, X } from "lucide-react";
import { AdminControlsProps, TextStyle } from "../types";
import {
  EMOJI_OPTIONS,
  MINIME_OPTIONS,
  MINIROOM_THEMES,
  TECH_BADGE_OPTIONS,
  TEXT_STYLES,
} from "../constants";
import { Button, Input } from "@/shared/components/ui";
import { useState } from "react";

export const AdminControls = ({
  showEmojiPicker,
  showMinimiPicker,
  showTextInput,
  showThemePicker,
  showBadgePicker,
  textInput,
  onToggleEmojiPicker,
  onToggleMinimiPicker,
  onToggleTextInput,
  onToggleThemePicker,
  onToggleBadgePicker,
  onTextInputChange,
  onAddEmoji,
  onAddMinime,
  onAddText,
  onAddBadge,
  onChangeTheme,
  currentTheme,
}: AdminControlsProps) => {
  const [textStyle, setTextStyle] = useState<TextStyle>("default");

  return (
    <div className="mb-3 p-3 bg-[#fff9e6] dark:bg-[#3a3000] border-2 border-[#ffd700] dark:border-[#a08000] rounded">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-xs text-yellow-800 dark:text-yellow-300">
          미니룸 꾸미기
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { label: "👤 미니미", handler: onToggleMinimiPicker },
          { label: "🎨 이모지", handler: onToggleEmojiPicker },
          { label: "🏷️ 기술 배지", handler: onToggleBadgePicker },
        ].map(({ label, handler }) => (
          <Button
            key={label}
            onClick={handler}
            size="sm"
            variant="outline"
            className="text-xs h-8 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {label}
          </Button>
        ))}
        <Button
          onClick={onToggleTextInput}
          size="sm"
          variant="outline"
          className="text-xs h-8 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Type className="w-3 h-3 mr-1" /> 텍스트
        </Button>
        <Button
          onClick={onToggleThemePicker}
          size="sm"
          variant="outline"
          className="text-xs h-8 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Palette className="w-3 h-3 mr-1" /> 테마
        </Button>
      </div>

      {/* Minime Picker */}
      {showMinimiPicker && (
        <div className="p-3 bg-white dark:bg-gray-800 border-2 border-blog-border dark:border-gray-600 rounded mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-800 dark:text-gray-200">
              미니미 선택
            </span>
            <button
              onClick={onToggleMinimiPicker}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {MINIME_OPTIONS.map((minime) => (
              <button
                key={minime.id}
                onClick={() => {
                  onAddMinime(minime);
                  onToggleMinimiPicker();
                }}
                className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors border border-gray-200 dark:border-gray-600"
              >
                <div className="w-12 h-14 flex items-end justify-center">
                  <img
                    src={minime.url}
                    alt={minime.name}
                    className="w-full h-full object-contain object-bottom"
                    draggable={false}
                  />
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 text-center leading-tight">
                  {minime.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="p-3 bg-white dark:bg-gray-800 border-2 border-blog-border dark:border-gray-600 rounded mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-700 dark:text-gray-200">
              이모지 선택
            </span>
            <button
              onClick={onToggleEmojiPicker}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onAddEmoji(emoji);
                  onToggleEmojiPicker();
                }}
                className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badge Picker */}
      {showBadgePicker && (
        <div className="p-3 bg-white dark:bg-gray-800 border-2 border-blog-border dark:border-gray-600 rounded mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-700 dark:text-gray-200">
              기술 배지 선택
            </span>
            <button
              onClick={onToggleBadgePicker}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TECH_BADGE_OPTIONS.map((badge) => (
              <button
                key={badge.id}
                onClick={() => {
                  onAddBadge(badge);
                  onToggleBadgePicker();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold hover:opacity-80 transition-opacity"
                style={{ backgroundColor: badge.color, color: "#fff" }}
              >
                <img
                  src={badge.icon}
                  alt={badge.label}
                  className="w-3.5 h-3.5"
                />
                {badge.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Input */}
      {showTextInput && (
        <div className="p-3 bg-white dark:bg-gray-800 border-2 border-blog-border dark:border-gray-600 rounded mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-700 dark:text-gray-200">
              텍스트 추가
            </span>
            <button
              onClick={onToggleTextInput}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            {TEXT_STYLES.map(({ style, label }) => (
              <button
                key={style}
                onClick={() => setTextStyle(style)}
                className={`flex-1 py-1.5 text-xs rounded border-2 transition-colors ${
                  textStyle === style
                    ? "border-blog-primary bg-blog-light dark:bg-gray-700 text-blog-primary"
                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blog-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={textInput}
              onChange={(e) => onTextInputChange(e.target.value)}
              placeholder="텍스트를 입력하세요..."
              className="flex-1 text-sm h-9 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onAddText(textStyle);
                  onToggleTextInput();
                }
              }}
            />
            <Button
              onClick={() => {
                onAddText(textStyle);
                onToggleTextInput();
              }}
              size="sm"
              className="h-9 text-xs bg-blog-primary hover:bg-blog-primary-hover"
            >
              추가
            </Button>
          </div>
        </div>
      )}

      {/* Theme Picker */}
      {showThemePicker && (
        <div className="p-3 bg-white dark:bg-gray-800 border-2 border-blog-border dark:border-gray-600 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-700 dark:text-gray-200">
              테마 선택:
            </span>
            <button
              onClick={onToggleThemePicker}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MINIROOM_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onChangeTheme(theme.id);
                  onToggleThemePicker();
                }}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors border-2 ${
                  theme.id === currentTheme.id
                    ? "border-blog-primary ring-2 ring-blog-primary"
                    : "border-gray-200 dark:border-gray-600"
                }`}
              >
                {theme.bgImage ? (
                  <div
                    className="w-full h-16 rounded overflow-hidden"
                    style={{
                      backgroundImage: `url(${theme.bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-16 rounded"
                    style={{
                      backgroundImage: `linear-gradient(${theme.gradient})`,
                    }}
                  />
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                  {theme.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
