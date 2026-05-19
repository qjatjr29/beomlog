import { slugify, cleanHeadingText } from "../utils/slugify";
import React, { useState } from "react";

type TocItem = { id: string; text: string; level: number };

export const TableOfContents = ({ content }: { content: string }) => {
  if (!content) return null;
  const lines = content.split(/\r?\n/);
  const items: TocItem[] = [];

  lines.forEach((line, idx) => {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim();
      const id = `${slugify(text)}-${idx}`;
      items.push({ id, text, level });
    }
  });

  if (items.length === 0) return null;

  // determine top level: prefer h1, else h2, else smallest found
  const levels = items.map((i) => i.level);
  let topLevel = levels.includes(1)
    ? 1
    : levels.includes(2)
      ? 2
      : Math.min(...levels);

  const [collapsed, setCollapsed] = useState(false);

  const handleTocClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${targetId}`);
  };

  // Numbering counters
  const counters = [0, 0, 0, 0, 0, 0];

  return (
    <nav
      className="mb-6 p-3 border border-gray-200 dark:border-gray-700 rounded-md"
      style={{
        backgroundColor: "var(--color-blog-light)",
        color: "var(--color-foreground)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          목차
        </div>
        <button
          onClick={() => setCollapsed((s) => !s)}
          className="text-xs text-gray-500 hover:text-blog-primary transition-colors"
          aria-expanded={!collapsed}
        >
          {collapsed ? "펼치기" : "접기"}
        </button>
      </div>

      {!collapsed && (
        <div className="text-sm">
          <div className="max-h-64 overflow-auto pr-2">
            <ul className="space-y-1">
              {items.map((it) => {
                const lvlIndex = it.level - topLevel; // 0-based
                const idx = Math.max(0, Math.min(5, lvlIndex));
                // increment current level counter and reset deeper
                counters[idx] = (counters[idx] || 0) + 1;
                for (let k = idx + 1; k < counters.length; k++) counters[k] = 0;
                const numbering = counters
                  .slice(0, idx + 1)
                  .filter((n) => n > 0)
                  .join(".");
                const displayText = cleanHeadingText(it.text);
                const isTop = it.level === topLevel;

                return (
                  <li
                    key={it.id}
                    style={{
                      paddingLeft: Math.max(0, (it.level - topLevel) * 12),
                    }}
                  >
                    <a
                      href={`#${it.id}`}
                      onClick={(event) => handleTocClick(event, it.id)}
                      className={`flex gap-3 items-start rounded-md px-2 py-1 transition-colors`}
                      style={
                        isTop
                          ? {
                              backgroundColor: "var(--color-blog-light)",
                              borderRadius: 6,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="text-xs shrink-0 inline-flex items-center justify-center w-9 h-6 rounded"
                        style={
                          isTop
                            ? {
                                backgroundColor: "var(--color-blog-primary)",
                                color: "white",
                                fontWeight: 700,
                              }
                            : {
                                backgroundColor: "var(--accent)",
                                color: "var(--color-muted-foreground)",
                              }
                        }
                      >
                        {numbering}
                      </span>
                      <span
                        className="truncate"
                        style={
                          isTop
                            ? { fontWeight: 600, color: "var(--color-primary)" }
                            : undefined
                        }
                      >
                        {displayText}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TableOfContents;
