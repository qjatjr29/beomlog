import { JSX } from "react";

interface BlockquoteState {
  inBlockquote: boolean;
  blockquoteLines: string[];
  inCallout: boolean;
  calloutLines: string[];
}

export const parseBlockquote = (
  line: string,
  state: BlockquoteState,
  index: number,
  BlockquoteBlock: any,
  CalloutBlock: any,
): {
  element?: JSX.Element;
  shouldReturn: boolean;
  newState: BlockquoteState;
} => {
  // ── callout 처리 (:::callout prefix) ──────────────────

  if (line.startsWith(":::callout ")) {
    const content = line.substring(":::callout ".length);
    return {
      shouldReturn: true,
      newState: {
        ...state,
        inCallout: true,
        calloutLines: [...state.calloutLines, content],
      },
    };
  }

  // callout 중인데 :::callout 이 아닌 줄 → callout 종료
  if (state.inCallout && !line.startsWith(":::callout ")) {
    return {
      element: (
        <CalloutBlock key={`callout-${index}`} lines={state.calloutLines} />
      ),
      shouldReturn: false,
      newState: {
        ...state,
        inCallout: false,
        calloutLines: [],
      },
    };
  }

  // ── quote 처리 (> prefix) ─────────────────────────────

  if (line.startsWith("> ")) {
    const content = line.substring(2);
    return {
      shouldReturn: true,
      newState: {
        ...state,
        inBlockquote: true,
        blockquoteLines: [...state.blockquoteLines, content],
      },
    };
  }

  // quote 중인데 > 가 아닌 줄 → quote 종료
  if (state.inBlockquote && !line.startsWith("> ")) {
    return {
      element: (
        <BlockquoteBlock key={`quote-${index}`} lines={state.blockquoteLines} />
      ),
      shouldReturn: false,
      newState: {
        ...state,
        inBlockquote: false,
        blockquoteLines: [],
      },
    };
  }

  return { shouldReturn: false, newState: state };
};
