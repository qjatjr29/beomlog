import { BlockquoteBlockProps } from "../../types";
import { parseInlineMarkdown } from "../../utils/parser";

export const BlockquoteBlock = ({ lines }: BlockquoteBlockProps) => {
  return (
    <blockquote className="border-l-4 border-blog-border pl-4 py-2 my-4 bg-blog-lighter rounded-r-lg">
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={i}>{parseInlineMarkdown(line)}</div>
        ))}
      </div>
    </blockquote>
  );
};
