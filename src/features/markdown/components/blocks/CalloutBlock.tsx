import { isValidElement } from "react";
import { parseInlineMarkdown } from "../../utils/parser";

interface CalloutBlockProps {
  lines: string[];
}

type CalloutVariant = "info" | "tip" | "warning" | "default";

type CalloutHeader = {
  icon: string;
  fallbackLabel: string;
  title: string | null;
};

const inlineNodesToText = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(inlineNodesToText).join("");
  }

  if (isValidElement(value)) {
    return inlineNodesToText((value as any).props?.children);
  }

  return "";
};

const normalizeEmoji = (value: string) =>
  value
    .replace(/\uFE0F/g, "")
    .replace(/\u200D/g, "")
    .trim();

const detectCalloutVariant = (firstLine: string): CalloutVariant => {
  const normalized = normalizeEmoji(firstLine);
  const firstToken = normalized.split(/\s+/)[0] || "";

  if (/^(ℹ|ⓘ|i)$/i.test(firstToken)) return "info";
  if (/^💡$/u.test(firstToken)) return "tip";
  if (/^(⚠|❗|‼|🚨)$/u.test(firstToken)) return "warning";

  return "default";
};

const getCalloutHeader = (
  variant: CalloutVariant,
  firstLine: string,
): CalloutHeader => {
  const normalized = normalizeEmoji(firstLine);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const rawTitle = tokens.length > 1 ? tokens.slice(1).join(" ") : null;
  const title = rawTitle
    ? inlineNodesToText(parseInlineMarkdown(rawTitle)).trim() || null
    : null;

  switch (variant) {
    case "info":
      return { icon: "ℹ", fallbackLabel: "Info", title };
    case "tip":
      return { icon: "💡", fallbackLabel: "Tip", title };
    case "warning":
      return { icon: "⚠", fallbackLabel: "Warning", title };
    default:
      return { icon: "ℹ", fallbackLabel: "Info", title: null };
  }
};

export const CalloutBlock = ({ lines }: CalloutBlockProps) => {
  const variant = detectCalloutVariant(lines[0] ?? "");
  const header = getCalloutHeader(variant, lines[0] ?? "");

  // icon이 있는 경우 첫 줄은 헤더 정보, icon이 없는 경우 첫 줄도 본문으로 간주
  const bodyLines = variant === "default" ? lines : lines.slice(1);

  const styles: Record<
    CalloutVariant,
    {
      border: string;
      headerBg: string;
      headerBorder: string;
      iconBg: string;
      iconText: string;
      titleText: string;
    }
  > = {
    info: {
      border: "border-blue-300",
      headerBg: "bg-blue-50",
      headerBorder: "border-blue-100",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      titleText: "text-blue-700",
    },
    tip: {
      border: "border-amber-300",
      headerBg: "bg-amber-50",
      headerBorder: "border-amber-100",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      titleText: "text-amber-700",
    },
    warning: {
      border: "border-rose-300",
      headerBg: "bg-rose-50",
      headerBorder: "border-rose-100",
      iconBg: "bg-rose-100",
      iconText: "text-rose-600",
      titleText: "text-rose-700",
    },
    default: {
      border: "border-blue-300",
      headerBg: "bg-blue-50",
      headerBorder: "border-blue-100",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      titleText: "text-blue-700",
    },
  };

  const s = styles[variant];

  const renderLine = (line: string, i: number) => {
    const orderedMatch = line.match(/^(\d+)\. (.*)/);
    if (orderedMatch) {
      return (
        <div key={i} className="flex gap-2">
          <span className="shrink-0 min-w-[1.2rem] text-right text-gray-500">
            {orderedMatch[1]}.
          </span>
          <span className="leading-relaxed">
            {parseInlineMarkdown(orderedMatch[2])}
          </span>
        </div>
      );
    }

    const bulletMatch = line.match(/^- (.*)/);
    if (bulletMatch) {
      return (
        <div key={i} className="flex gap-2">
          <span className="shrink-0 text-gray-400">•</span>
          <span className="leading-relaxed">
            {parseInlineMarkdown(bulletMatch[1])}
          </span>
        </div>
      );
    }

    if (line.startsWith("> ")) {
      return (
        <div
          key={i}
          className="pl-3 border-l-2 border-gray-200 leading-relaxed"
        >
          {parseInlineMarkdown(line.substring(2))}
        </div>
      );
    }

    if (line.trim() === "") {
      return <div key={i} className="h-2" />;
    }

    return (
      <div key={i} className="leading-relaxed text-gray-600 dark:text-gray-400">
        {parseInlineMarkdown(line)}
      </div>
    );
  };

  const groupedLines: {
    type: "list" | "single";
    lines: string[];
    startIndex: number;
  }[] = [];
  let i = 0;
  while (i < bodyLines.length) {
    const line = bodyLines[i];
    const isListItem = /^(\d+)\. /.test(line) || /^- /.test(line);
    if (isListItem) {
      const group: string[] = [line];
      let j = i + 1;
      while (
        j < bodyLines.length &&
        (/^(\d+)\. /.test(bodyLines[j]) || /^- /.test(bodyLines[j]))
      ) {
        group.push(bodyLines[j]);
        j++;
      }
      groupedLines.push({ type: "list", lines: group, startIndex: i });
      i = j;
    } else {
      groupedLines.push({ type: "single", lines: [line], startIndex: i });
      i++;
    }
  }

  return (
    <div
      className={`my-6 overflow-hidden rounded-md border ${s.border} bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900`}
    >
      <div
        className={`${s.headerBg} border-b ${s.headerBorder} px-4 py-2.5 flex items-center gap-2`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${s.iconBg} ${s.iconText}`}
        >
          {header.icon}
        </div>
        <div className={`text-sm font-semibold leading-none ${s.titleText}`}>
          {variant === "default"
            ? header.fallbackLabel
            : header.title || header.fallbackLabel}
        </div>
      </div>
      <div className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
        {groupedLines.map((group, gi) => {
          if (group.type === "list") {
            return (
              <div key={gi} className={`space-y-1 ${gi > 0 ? "mt-2" : ""}`}>
                {group.lines.map((line, li) =>
                  renderLine(line, group.startIndex + li),
                )}
              </div>
            );
          }

          return (
            <div
              key={gi}
              className={gi > 0 && group.lines[0].trim() !== "" ? "mt-2" : ""}
            >
              {renderLine(group.lines[0], group.startIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
