import { JSX } from "react";
import { parseInlineMarkdown } from "../../utils/parser";

export const parseHeader = (
  line: string,
  index: number,
): JSX.Element | null => {
  if (line.startsWith("# ")) {
    return (
      <h1
        key={`h1-${index}`}
        className="text-2xl font-bold mt-8 mb-4 pb-2 border-b-2 border-dotted border-gray-300"
      >
        {parseInlineMarkdown(line.substring(2))}
      </h1>
    );
  }

  if (line.startsWith("## ")) {
    return (
      <h2 key={`h2-${index}`} className="text-xl font-bold mt-6 mb-3">
        {parseInlineMarkdown(line.substring(3))}
      </h2>
    );
  }

  if (line.startsWith("### ")) {
    return (
      <h3 key={`h3-${index}`} className="text-lg font-bold mt-5 mb-2">
        {parseInlineMarkdown(line.substring(4))}
      </h3>
    );
  }

  return null;
};
