import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

interface SearchToggleProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  onOpen?: () => void;
}

export const SearchToggle = ({
  value,
  onChange,
  placeholder = "검색",
  onOpen,
}: SearchToggleProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [inputValue, onChange, open, value]);

  const handleOpen = () => {
    setInputValue(value);
    setOpen(true);
    if (onOpen) onOpen();
  };

  return (
    <div className="relative">
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className="p-1.5 rounded text-gray-500 hover:text-blog-primary"
          title="검색"
        >
          <Search className="w-4 h-4" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-40 sm:w-60 rounded-full border border-blog-border-light dark:border-gray-700 bg-white dark:bg-gray-800 pl-3 pr-2 py-1 text-[12px] text-gray-700 dark:text-gray-200 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              onChange("");
              setOpen(false);
            }}
            className="p-1.5 rounded text-gray-400 hover:text-gray-600"
            title="지우기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
