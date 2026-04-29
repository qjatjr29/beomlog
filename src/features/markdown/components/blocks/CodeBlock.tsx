import { useState, useEffect, useRef } from "react";
import hljs from "highlight.js";
import { CodeBlockProps } from "../../types";

// 언어별 색상 배지
const LANGUAGE_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  javascript: { bg: "#f7df1e", text: "#000", label: "JavaScript" },
  typescript: { bg: "#3178c6", text: "#fff", label: "TypeScript" },
  java: { bg: "#ed8b00", text: "#fff", label: "Java" },
  kotlin: { bg: "#7f52ff", text: "#fff", label: "Kotlin" },
  python: { bg: "#3572a5", text: "#fff", label: "Python" },
  sql: { bg: "#e38c00", text: "#fff", label: "SQL" },
  bash: { bg: "#4eaa25", text: "#fff", label: "Bash" },
  shell: { bg: "#4eaa25", text: "#fff", label: "Shell" },
  json: { bg: "#292929", text: "#fff", label: "JSON" },
  html: { bg: "#e34c26", text: "#fff", label: "HTML" },
  css: { bg: "#264de4", text: "#fff", label: "CSS" },
  go: { bg: "#00add8", text: "#fff", label: "Go" },
  rust: { bg: "#dea584", text: "#000", label: "Rust" },
  plain_text: { bg: "#6b7280", text: "#fff", label: "Text" },
  text: { bg: "#6b7280", text: "#fff", label: "Text" },
};

const getLanguageInfo = (lang: string) => {
  const normalized = lang.toLowerCase().trim();
  return (
    LANGUAGE_COLORS[normalized] ?? {
      bg: "#5b8ec4",
      text: "#fff",
      label: lang.toUpperCase() || "CODE",
    }
  );
};

export const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const langInfo = getLanguageInfo(language);

  useEffect(() => {
    if (codeRef.current) {
      // 이미 하이라이팅된 경우 방지
      if (!codeRef.current.dataset.highlighted) {
        hljs.highlightElement(codeRef.current);
      }
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-gray-700 dark:border-gray-600 shadow-lg">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-600">
        <div className="flex items-center gap-2">
          {/* 언어 배지 */}
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: langInfo.bg, color: langInfo.text }}
          >
            {langInfo.label}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
        >
          {copied ? (
            <>
              <svg
                className="w-3.5 h-3.5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-400">복사됨!</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>복사</span>
            </>
          )}
        </button>
      </div>

      {/* 코드 영역 */}
      <div className="bg-[#1e1e2e] dark:bg-[#13131f] overflow-x-auto">
        <pre className="p-4 m-0 text-sm leading-relaxed">
          <code
            ref={codeRef}
            className={`language-${language} hljs`}
            style={{ background: "transparent" }}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};
