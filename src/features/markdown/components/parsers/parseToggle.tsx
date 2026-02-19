import { JSX } from "react";

interface ToggleState {
  inDetails: boolean;
  detailsStack: number;
  detailsContent: string[];
  detailsSummary: string;
}

export const parseToggle = (
  line: string,
  state: ToggleState,
  index: number,
  ToggleBlock: any,
): {
  element?: JSX.Element;
  shouldReturn: boolean;
  newState: ToggleState;
} => {
  const detailsOpenMatch = line.match(/^<details>$/);
  if (detailsOpenMatch) {
    if (state.detailsStack === 0) {
      return {
        shouldReturn: true,
        newState: {
          inDetails: true,
          detailsStack: 1,
          detailsContent: [],
          detailsSummary: "상세 내용",
        },
      };
    } else {
      return {
        shouldReturn: true,
        newState: {
          ...state,
          detailsStack: state.detailsStack + 1,
          detailsContent: [...state.detailsContent, line],
        },
      };
    }
  }

  const summaryMatch = line.match(/^<summary>(.+)<\/summary>$/);
  if (summaryMatch && state.inDetails) {
    if (state.detailsStack === 1) {
      return {
        shouldReturn: true,
        newState: {
          ...state,
          detailsSummary: summaryMatch[1],
        },
      };
    } else {
      return {
        shouldReturn: true,
        newState: {
          ...state,
          detailsContent: [...state.detailsContent, line],
        },
      };
    }
  }

  const detailsCloseMatch = line.match(/^<\/details>$/);
  if (detailsCloseMatch && state.inDetails) {
    const newStack = state.detailsStack - 1;
    if (newStack === 0) {
      return {
        element: (
          <ToggleBlock
            key={`toggle-${index}`}
            summary={state.detailsSummary}
            content={state.detailsContent.join("\n")}
          />
        ),
        shouldReturn: true,
        newState: {
          inDetails: false,
          detailsStack: 0,
          detailsContent: [],
          detailsSummary: "",
        },
      };
    } else {
      return {
        shouldReturn: true,
        newState: {
          ...state,
          detailsStack: newStack,
          detailsContent: [...state.detailsContent, line],
        },
      };
    }
  }

  if (state.inDetails) {
    return {
      shouldReturn: true,
      newState: {
        ...state,
        detailsContent: [...state.detailsContent, line],
      },
    };
  }

  return { shouldReturn: false, newState: state };
};
