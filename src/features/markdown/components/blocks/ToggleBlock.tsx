import { useState } from "react";
import { ToggleBlockProps } from "../../types";
import { MarkdownRenderer } from "../MarkdownRenderer";

export const ToggleBlock = ({ summary, content }: ToggleBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <details
      className="my-4 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary className="px-4 py-3 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-300">
          {isOpen ? "▼" : "▶"}
        </span>
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {summary}
        </span>
      </summary>
      <div className="px-4 py-3 bg-white dark:bg-gray-800">
        <MarkdownRenderer content={content} />
      </div>
    </details>
  );
};
