import { BlockquoteBlockProps } from "../../types";
import { parseInlineMarkdown } from "../../utils/parser";

export const BlockquoteBlock = ({ lines }: BlockquoteBlockProps) => {
  // 중첩된 > > 를 들여쓰기로 처리
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

  return (
    <blockquote className="border-l-4 border-blog-border pl-4 py-2 my-4 bg-blog-lighter dark:bg-gray-800 rounded-r-lg">
      <div className="space-y-1 text-gray-700 dark:text-gray-300">
        {lines.map((line, i) => renderLine(line, i))}
      </div>
    </blockquote>
  );
};
