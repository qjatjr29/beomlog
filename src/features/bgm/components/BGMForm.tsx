import { Check, X } from "lucide-react";
import { useState } from "react";
import { BgmFormProps } from "../types";

export const BgmForm = ({
  initialUrl = "",
  initialTitle = "",
  error,
  onSubmit,
  onCancel,
  submitLabel,
}: BgmFormProps) => {
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);

  return (
    <div className="space-y-1.5 p-2 bg-blog-lighter dark:bg-gray-700 border border-blog-border dark:border-gray-600 rounded">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="YouTube URL 또는 영상 ID"
        className="w-full text-xs border border-blog-border dark:border-gray-500 rounded px-2 py-1.5 outline-none focus:border-blog-primary bg-white dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
        autoFocus
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="w-full text-xs border border-blog-border dark:border-gray-500 rounded px-2 py-1.5 outline-none focus:border-blog-primary bg-white dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
        onKeyDown={(e) => e.key === "Enter" && onSubmit(url, title)}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-1.5">
        <button
          onClick={() => onSubmit(url, title)}
          className="flex-1 flex justify-center items-center gap-1 text-xs bg-blog-primary text-white rounded py-1.5 hover:bg-blog-primary-hover"
        >
          <Check className="w-3 h-3" /> {submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 flex justify-center items-center gap-1 text-xs border border-gray-300 dark:border-gray-500 rounded py-1.5 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          <X className="w-3 h-3" /> 취소
        </button>
      </div>
    </div>
  );
};
