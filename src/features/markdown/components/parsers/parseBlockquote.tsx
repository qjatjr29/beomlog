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
    if (!state.inBlockquote) {
      return {
        shouldReturn: true,
        newState: {
          inBlockquote: true,
          blockquoteLines: [line.substring(2)],
        },
      };
    } else {
      return {
        shouldReturn: true,
        newState: {
          ...state,
          blockquoteLines: [...state.blockquoteLines, line.substring(2)],
        },
      };
    }
  }

  if (state.inBlockquote && !line.startsWith("> ")) {
    return {
      element: (
        <BlockquoteBlock key={`quote-${index}`} lines={state.blockquoteLines} />
      ),
      shouldReturn: false,
      newState: {
        inBlockquote: false,
        blockquoteLines: [],
      },
    };
  }

  if (state.inBlockquote) {
    return { shouldReturn: true, newState: state };
  }

  return { shouldReturn: false, newState: state };
};
