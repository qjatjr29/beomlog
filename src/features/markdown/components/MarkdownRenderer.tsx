import { JSX } from "react";
import { MarkdownRendererProps } from "../types";
import {
  CodeBlock,
  ToggleBlock,
  BookmarkBlock,
  InlineLink,
  ImageBlock,
  BlockquoteBlock,
  TableBlock,
  CalloutBlock,
} from "./blocks";
import {
  parseCodeBlock,
  parseBlockquote,
  parseTable,
  parseToggle,
  parseBookmark,
  parseHtmlImage,
  parseMarkdownImage,
  parseHeader,
  parseUnorderedList,
  parseOrderedList,
  parseInlineLink,
  parseParagraph,
  parseHorizontalRule,
  parseEmptyLine,
  parseVideoBlock,
  parseFigure,
} from "./parsers";

// 연속된 inline-link들을 하나의 박스로 그룹핑
const groupInlineLinks = (elements: JSX.Element[]): JSX.Element[] => {
  const grouped: JSX.Element[] = [];
  let linkGroup: { url: string; domain: string }[] = [];
  let linkGroupKey = "";

  const flushLinkGroup = () => {
    if (linkGroup.length === 0) return;

    grouped.push(
      <div
        key={`link-group-${linkGroupKey}`}
        className="my-3 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden"
      >
        <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
          <span className="text-[11px] text-blue-500 font-medium">
            🔗 Links
          </span>
        </div>
        <ul className="divide-y divide-blue-100 dark:divide-blue-900">
          {linkGroup.map(({ url, domain }, idx) => (
            <li key={idx}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                  alt=""
                  className="w-4 h-4 shrink-0 rounded-sm"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16"%3E%3Crect fill="%2393c5fd" width="16" height="16" rx="2"/%3E%3C/svg%3E';
                  }}
                />
                <span className="text-sm text-blue-700 dark:text-blue-300 flex-1 truncate">
                  {url}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-blue-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>,
    );
    linkGroup = [];
    linkGroupKey = "";
  };

  for (const el of elements) {
    const key = el.key?.toString() ?? "";
    const isInlineLink = key.startsWith("inline-link-");

    if (isInlineLink) {
      const child = (el.props as any)?.children;
      const url: string = child?.props?.url ?? "";
      const domain: string = child?.props?.domain ?? "";

      if (url) {
        if (linkGroup.length === 0) linkGroupKey = key;
        linkGroup.push({ url, domain });
      } else {
        flushLinkGroup();
        grouped.push(el);
      }
    } else {
      flushLinkGroup();
      grouped.push(el);
    }
  }

  flushLinkGroup();
  return grouped;
};

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    const result: JSX.Element[] = [];

    const state = {
      inCodeBlock: false,
      codeBlockContent: [] as string[],
      codeBlockLang: "",
      inBlockquote: false,
      blockquoteLines: [] as string[],
      inCallout: false,
      calloutLines: [] as string[],
      inTable: false,
      tableLines: [] as string[],
      inDetails: false,
      detailsStack: 0,
      detailsContent: [] as string[],
      detailsSummary: "",
      inBookmark: false,
      bookmarkLines: [] as string[],
      inUnorderedList: false,
      unorderedListItems: [] as JSX.Element[],
      inOrderedList: false,
      orderedListItems: [] as JSX.Element[],
      inFigure: false,
      figureLines: [] as string[],
    };

    const closeLists = (currentIndex: number) => {
      if (state.inUnorderedList) {
        result.push(
          <ul
            key={`ul-wrapper-${currentIndex}-${result.length}`}
            className="my-4"
          >
            {state.unorderedListItems}
          </ul>,
        );
        state.unorderedListItems = [];
        state.inUnorderedList = false;
      }
      if (state.inOrderedList) {
        result.push(
          <ol
            key={`ol-wrapper-${currentIndex}-${result.length}`}
            className="my-4"
          >
            {state.orderedListItems}
          </ol>,
        );
        state.orderedListItems = [];
        state.inOrderedList = false;
      }
    };

    lines.forEach((line, index) => {
      // 1. Code Block
      const codeResult = parseCodeBlock(
        line,
        {
          inCodeBlock: state.inCodeBlock,
          codeBlockContent: state.codeBlockContent,
          codeBlockLang: state.codeBlockLang,
        },
        index,
        CodeBlock,
      );

      if (codeResult.shouldReturn) {
        if (codeResult.element) {
          closeLists(index);
          result.push(codeResult.element);
        }
        state.inCodeBlock = codeResult.newState.inCodeBlock;
        state.codeBlockContent = codeResult.newState.codeBlockContent;
        state.codeBlockLang = codeResult.newState.codeBlockLang;
        return;
      }

      // 2. Blockquote
      const blockquoteResult = parseBlockquote(
        line,
        {
          inBlockquote: state.inBlockquote,
          blockquoteLines: state.blockquoteLines,
          inCallout: state.inCallout, // 추가
          calloutLines: state.calloutLines, // 추가
        },
        index,
        BlockquoteBlock,
        CalloutBlock,
      );

      if (blockquoteResult.shouldReturn || blockquoteResult.element) {
        if (blockquoteResult.element) {
          closeLists(index);
          result.push(blockquoteResult.element);
        }
        state.inBlockquote = blockquoteResult.newState.inBlockquote;
        state.blockquoteLines = blockquoteResult.newState.blockquoteLines;
        state.inCallout = blockquoteResult.newState.inCallout; // 추가
        state.calloutLines = blockquoteResult.newState.calloutLines; // 추가
        if (blockquoteResult.shouldReturn) return;
      }

      // 3. Table
      const tableResult = parseTable(
        line,
        {
          inTable: state.inTable,
          tableLines: state.tableLines,
        },
        index,
        TableBlock,
      );

      if (tableResult.shouldReturn || tableResult.element) {
        if (tableResult.element) {
          closeLists(index);
          result.push(tableResult.element);
        }
        state.inTable = tableResult.newState.inTable;
        state.tableLines = tableResult.newState.tableLines;
        if (tableResult.shouldReturn) return;
      }

      // 4. Toggle
      const toggleResult = parseToggle(
        line,
        {
          inDetails: state.inDetails,
          detailsStack: state.detailsStack,
          detailsContent: state.detailsContent,
          detailsSummary: state.detailsSummary,
        },
        index,
        ToggleBlock,
      );

      if (toggleResult.shouldReturn) {
        if (toggleResult.element) {
          closeLists(index);
          result.push(toggleResult.element);
        }
        state.inDetails = toggleResult.newState.inDetails;
        state.detailsStack = toggleResult.newState.detailsStack;
        state.detailsContent = toggleResult.newState.detailsContent;
        state.detailsSummary = toggleResult.newState.detailsSummary;
        return;
      }

      // 5. Bookmark
      const bookmarkResult = parseBookmark(
        line,
        {
          inBookmark: state.inBookmark,
          bookmarkLines: state.bookmarkLines,
        },
        index,
        BookmarkBlock,
      );

      if (bookmarkResult.shouldReturn) {
        if (bookmarkResult.element) {
          closeLists(index);
          result.push(bookmarkResult.element);
        }
        state.inBookmark = bookmarkResult.newState.inBookmark;
        state.bookmarkLines = bookmarkResult.newState.bookmarkLines;
        return;
      }

      // 6. Images
      const figureResult = parseFigure(line, index, {
        inFigure: state.inFigure,
        figureLines: state.figureLines,
      });
      if (figureResult.handled) {
        if (figureResult.element) {
          closeLists(index);
          result.push(figureResult.element);
        }
        state.inFigure = figureResult.state.inFigure;
        state.figureLines = figureResult.state.figureLines;
        return;
      }
      const htmlImg = parseHtmlImage(line, index, ImageBlock);
      if (htmlImg) {
        closeLists(index);
        result.push(htmlImg);
        return;
      }

      const mdImg = parseMarkdownImage(line, index, ImageBlock);
      if (mdImg) {
        closeLists(index);
        result.push(mdImg);
        return;
      }

      const video = parseVideoBlock(line, index);
      if (video) {
        closeLists(index);
        result.push(video);
        return;
      }

      // 7. Horizontal Rule
      const hr = parseHorizontalRule(line, index);
      if (hr) {
        closeLists(index);
        result.push(hr);
        return;
      }

      // 8. Headers
      const header = parseHeader(line, index);
      if (header) {
        closeLists(index);
        result.push(header);
        return;
      }

      // 9. Lists
      const ulItem = parseUnorderedList(line, index);
      if (ulItem) {
        if (state.inOrderedList && /^\s+- /.test(line)) {
          state.orderedListItems.push(ulItem);
          return;
        }
        if (state.inOrderedList) {
          result.push(
            <ol key={`ol-close-${index}-${result.length}`} className="my-4">
              {state.orderedListItems}
            </ol>,
          );
          state.orderedListItems = [];
          state.inOrderedList = false;
        }
        state.inUnorderedList = true;
        state.unorderedListItems.push(ulItem);
        return;
      }

      const olItem = parseOrderedList(line, index);
      if (olItem) {
        if (state.inUnorderedList) {
          result.push(
            <ul key={`ul-close-${index}-${result.length}`} className="my-4">
              {state.unorderedListItems}
            </ul>,
          );
          state.unorderedListItems = [];
          state.inUnorderedList = false;
        }
        state.inOrderedList = true;
        state.orderedListItems.push(olItem);
        return;
      }

      // 10. Empty line
      const emptyLine = parseEmptyLine(line, index);
      if (emptyLine) {
        closeLists(index);
        result.push(emptyLine);
        return;
      }

      // 11. Inline Link
      const inlineLink = parseInlineLink(line, index, InlineLink);
      if (inlineLink) {
        closeLists(index);
        result.push(inlineLink);
        return;
      }

      // 12. Paragraph
      closeLists(index);
      result.push(parseParagraph(line, index));
    });

    // Cleanup
    if (state.inUnorderedList && state.unorderedListItems.length > 0) {
      result.push(
        <ul key="ul-end" className="my-4">
          {state.unorderedListItems}
        </ul>,
      );
    }
    if (state.inOrderedList && state.orderedListItems.length > 0) {
      result.push(
        <ol key="ol-end" className="my-4">
          {state.orderedListItems}
        </ol>,
      );
    }

    // inline-link 그룹핑 후처리
    return groupInlineLinks(result);
  };

  return (
    <div className="markdown-content max-w-none wrap-break-word text-gray-700 dark:text-gray-300">
      {parseMarkdown(content)}
    </div>
  );
};
