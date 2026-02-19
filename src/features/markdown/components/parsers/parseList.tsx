import { JSX } from "react";
import { parseInlineMarkdown } from "../../utils/parser";

export const parseUnorderedList = (
  line: string,
  index: number,
): JSX.Element | null => {
  if (!line.startsWith("- ")) return null;

  return (
    <li key={`ul-item-${index}`} className="ml-6 my-1.5 list-disc">
      {parseInlineMarkdown(line.substring(2))}
    </li>
  );
};

export const parseOrderedList = (
  line: string,
  index: number,
): JSX.Element | null => {
  if (!/^\d+\.\s/.test(line)) return null;

  const content = line.replace(/^\d+\.\s/, "");
  return (
    <li key={`ol-item-${index}`} className="ml-6 my-1.5 list-decimal">
      {parseInlineMarkdown(content)}
    </li>
  );
};
