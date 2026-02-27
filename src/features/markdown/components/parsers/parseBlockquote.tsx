import { JSX } from "react";

interface BlockquoteState {
  inBlockquote: boolean;
  blockquoteLines: string[];
}

export const parseBlockquote = (
  line: string,
  state: BlockquoteState,
  index: number,
  BlockquoteBlock: any,
): {
  element?: JSX.Element;
  shouldReturn: boolean;
  newState: BlockquoteState;
} => {
  if (line.startsWith("> ")) {
    const content = line.substring(2);
    return {
      shouldReturn: true,
      newState: {
        inBlockquote: true,
        blockquoteLines: [...state.blockquoteLines, content],
      },
    };
  }

  if (state.inBlockquote && !line.startsWith("> ")) {
    return {
      element: (
        <BlockquoteBlock key={`quote-${index}`} lines={state.blockquoteLines} />
      ),
      shouldReturn: false,
      newState: { inBlockquote: false, blockquoteLines: [] },
    };
  }

  return { shouldReturn: false, newState: state };
};
