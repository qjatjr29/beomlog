import { BlockquoteBlockProps } from "../../types";
import { parseInlineMarkdown } from "../../utils/parser";

export const BlockquoteBlock = ({ lines }: BlockquoteBlockProps) => {
  const renderLine = (line: string, i: number) => {
    if (line.startsWith("> ")) {
      return (
        <div key={i} className="pl-3 border-l-2 border-blog-border-light mt-1">
          <span className="text-gray-600 text-sm">
            {parseInlineMarkdown(line.substring(2))}
          </span>
        </div>
      );
    }
    return <div key={i}>{parseInlineMarkdown(line)}</div>;
  };

  const groupedLines: {
    type: "list" | "single";
    lines: string[];
    startIndex: number;
  }[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const isListItem = /^- /.test(line) && !line.startsWith("> ");
    if (isListItem) {
      const group: string[] = [line];
      let j = i + 1;
      while (
        j < lines.length &&
        /^- /.test(lines[j]) &&
        !lines[j].startsWith("> ")
      ) {
        group.push(lines[j]);
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
    <blockquote className="my-3 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-1.5 dark:border-gray-700 dark:bg-gray-800/80">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Comment
        </span>
      </div>
      <div className="border-l-4 border-blog-border px-4 py-4 text-gray-700 dark:text-gray-300">
        <div className="space-y-1">
          {groupedLines.map((group, gi) => {
            if (group.type === "list") {
              return (
                <ul
                  key={gi}
                  className="list-disc space-y-1 pl-5 text-sm leading-relaxed"
                >
                  {group.lines.map((line, li) => (
                    <li key={li} className="text-gray-700 dark:text-gray-300">
                      {parseInlineMarkdown(line.replace(/^\-\s+/, ""))}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <div key={gi}>{renderLine(group.lines[0], group.startIndex)}</div>
            );
          })}
        </div>
      </div>
    </blockquote>
  );
};
