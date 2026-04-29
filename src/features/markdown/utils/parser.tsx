import { JSX } from "react";
import { getColorStyle } from "./color-styles";

export const parseInlineMarkdown = (text: string): (string | JSX.Element)[] => {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const patterns = [
      { name: "span", regex: /<span class="text-([^"]+)">([\s\S]*?)<\/span>/ },
      { name: "underline", regex: /<u>([\s\S]*?)<\/u>/ },
      { name: "link", regex: /\[([^\]]+)\]\(([^\)]+)\)/ },
      { name: "code", regex: /`([\s\S]*?)`/ },
      { name: "bolditalic", regex: /\*\*\*([\s\S]*?)\*\*\*/ },
      { name: "bold", regex: /\*\*([\s\S]*?)\*\*/ },
      { name: "strike", regex: /~~([\s\S]*?)~~/ },
      { name: "italic", regex: /(_|\*)([\s\S]*?)\1/ },
    ];

    let earliestMatch = null;
    let earliestIndex = Infinity;
    let earliestPattern = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined && match.index < earliestIndex) {
        earliestMatch = match;
        earliestIndex = match.index;
        earliestPattern = pattern.name;
      }
    }

    if (!earliestMatch) {
      parts.push(remaining);
      break;
    }

    if (earliestIndex > 0) {
      parts.push(remaining.substring(0, earliestIndex));
    }

    switch (earliestPattern) {
      case "span": {
        const color = earliestMatch[1];
        const innerContent = earliestMatch[2];
        const innerParsed = parseInlineMarkdown(innerContent);
        const colorStyle = getColorStyle(color);
        parts.push(
          <span key={key++} style={colorStyle}>
            {innerParsed}
          </span>,
        );
        break;
      }

      case "underline": {
        const innerParsed = parseInlineMarkdown(earliestMatch[1]);
        parts.push(
          <u
            key={key++}
            className="underline decoration-2"
            style={{ color: "inherit" }}
          >
            {innerParsed}
          </u>,
        );
        break;
      }

      case "link": {
        const linkText = earliestMatch[1];
        const url = earliestMatch[2];
        parts.push(
          // 인라인 링크는 blog-primary 변수 대신 CSS 변수 직접 참조
          // (JSX style prop에서는 Tailwind 클래스를 쓸 수 없으므로 className 사용)
          <a
            key={key++}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blog-primary hover:text-blog-primary-hover underline transition-colors"
          >
            {linkText}
          </a>,
        );
        break;
      }

      case "code": {
        const innerParsed = parseInlineMarkdown(earliestMatch[1]);
        parts.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 rounded text-sm font-mono
        bg-gray-100 text-gray-800
        dark:bg-gray-700 dark:text-gray-200
        border border-gray-200 dark:border-gray-600"
            // className="bg-stone-100 px-2 py-0.5 rounded text-sm font-mono"
            // style={{ color: "inherit", backgroundColor: "#ededeb" }}
          >
            {innerParsed}
          </code>,
        );
        break;
      }

      case "bolditalic": {
        const innerParsed = parseInlineMarkdown(earliestMatch[1]);
        parts.push(
          <strong
            key={key++}
            className="font-bold italic"
            style={{ color: "inherit" }}
          >
            <em>{innerParsed}</em>
          </strong>,
        );
        break;
      }

      case "bold": {
        const innerParsed = parseInlineMarkdown(earliestMatch[1]);
        parts.push(
          <strong
            key={key++}
            className="font-bold"
            style={{ color: "inherit" }}
          >
            {innerParsed}
          </strong>,
        );
        break;
      }

      case "strike": {
        const innerParsed = parseInlineMarkdown(earliestMatch[1]);
        parts.push(
          <del
            key={key++}
            className="line-through"
            style={{ color: "inherit", opacity: 0.6 }}
          >
            {innerParsed}
          </del>,
        );
        break;
      }

      case "italic": {
        const innerParsed = parseInlineMarkdown(earliestMatch[2]);
        parts.push(
          <em key={key++} className="italic" style={{ color: "inherit" }}>
            {innerParsed}
          </em>,
        );
        break;
      }
    }

    remaining = remaining.substring(earliestIndex + earliestMatch[0].length);
  }

  return parts;
};

// ===== parseTable - 색상 변경 없음 (gray 계열만 사용) =====
export const parseTable = (
  tableLines: string[],
  key: number,
): JSX.Element | null => {
  if (tableLines.length < 2) return null;

  const rows = tableLines.map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell !== ""),
  );

  const headers = rows[0];
  const dataRows = rows.slice(2);

  return (
    <table key={key} className="w-full my-6 border-collapse">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900"
            >
              {parseInlineMarkdown(header)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataRows.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            {row.map((cell, j) => (
              <td
                key={j}
                className="border border-gray-300 px-4 py-2 text-gray-700"
              >
                {parseInlineMarkdown(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
