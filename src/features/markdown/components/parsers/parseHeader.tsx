import { JSX } from "react";
import { parseInlineMarkdown } from "../../utils/parser";
import { slugify } from "../../utils/slugify";

export const parseHeader = (
  line: string,
  index: number,
): JSX.Element | null => {
  if (line.startsWith("# ")) {
    return (
      <h1
        key={`h1-${index}`}
        id={`${slugify(line.substring(2))}-${index}`}
        style={{ scrollMarginTop: 80 }}
        className="text-3xl font-bold mt-10 mb-5 pb-2 border-b-2 border-gray-300 dark:border-gray-600"
      >
        {parseInlineMarkdown(line.substring(2))}
      </h1>
    );
  }

  if (line.startsWith("## ")) {
    return (
      <h2
        key={`h2-${index}`}
        id={`${slugify(line.substring(3))}-${index}`}
        style={{ scrollMarginTop: 80 }}
        className="text-2xl font-bold mt-8 mb-4 pb-2 border-b  border-gray-300 dark:border-gray-600"
      >
        {parseInlineMarkdown(line.substring(3))}
      </h2>
    );
  }

  if (line.startsWith("### ")) {
    return (
      <h3
        key={`h3-${index}`}
        id={`${slugify(line.substring(4))}-${index}`}
        style={{ scrollMarginTop: 80 }}
        className="text-xl font-bold mt-6 mb-3"
      >
        {parseInlineMarkdown(line.substring(4))}
      </h3>
    );
  }

  if (line.startsWith("#### ")) {
    return (
      <h4
        key={`h4-${index}`}
        id={`${slugify(line.substring(5))}-${index}`}
        style={{
          scrollMarginTop: 80,
        }}
        className="text-lg font-bold mt-4 mb-3"
      >
        {parseInlineMarkdown(line.substring(5))}
      </h4>
    );
  }

  return null;
};
