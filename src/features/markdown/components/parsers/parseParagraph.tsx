import { JSX } from "react";
import { parseInlineMarkdown } from "../../utils/parser";

export const parseParagraph = (line: string, index: number): JSX.Element => {
  return (
    <p key={`p-${index}`} className="my-4 leading-relaxed">
      {parseInlineMarkdown(line)}
    </p>
  );
};

export const parseHorizontalRule = (
  line: string,
  index: number,
): JSX.Element | null => {
  if (line !== "---") return null;
  return <hr key={`hr-${index}`} className="my-8 border-t-2 border-gray-300" />;
};

export const parseEmptyLine = (
  line: string,
  index: number,
): JSX.Element | null => {
  if (line.trim() !== "") return null;
  return <div key={`empty-${index}`} className="h-4"></div>;
};

