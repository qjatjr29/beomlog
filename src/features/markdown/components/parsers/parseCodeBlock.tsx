import { JSX } from "react";

interface CodeBlockState {
  inCodeBlock: boolean;
  codeBlockContent: string[];
  codeBlockLang: string;
}

export const parseCodeBlock = (
  line: string,
  state: CodeBlockState,
  index: number,
  CodeBlock: any
): {
  element?: JSX.Element;
  shouldReturn: boolean;
  newState: CodeBlockState;
} => {
  if (line.startsWith("```")) {
    if (!state.inCodeBlock) {
      return {
        shouldReturn: true,
        newState: {
          inCodeBlock: true,
          codeBlockLang: line.substring(3),
          codeBlockContent: [],
        },
      };
    } else {
      const code = state.codeBlockContent.join("\n");
      return {
        element: (
          <CodeBlock key={`code-${index}`} code={code} language={state.codeBlockLang} />
        ),
        shouldReturn: true,
        newState: {
          inCodeBlock: false,
          codeBlockContent: [],
          codeBlockLang: "",
        },
      };
    }
  }

  if (state.inCodeBlock) {
    return {
      shouldReturn: true,
      newState: {
        ...state,
        codeBlockContent: [...state.codeBlockContent, line],
      },
    };
  }

  return { shouldReturn: false, newState: state };
};