import { useState } from "react";
import { ToggleBlockProps } from "../../types";
import { MarkdownRenderer } from "../MarkdownRenderer";

export const ToggleBlock = ({ summary, content }: ToggleBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="my-4 border border-gray-300 rounded-lg overflow-hidden"
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2">
        <span className="text-gray-600">{isOpen ? "▼" : "▶"}</span>
        <span className="font-medium">{summary}</span>
      </summary>
      <div className="px-4 py-3 bg-white">
        <MarkdownRenderer content={content} />
      </div>
    </details>
  );
};
