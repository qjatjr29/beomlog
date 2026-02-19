import { JSX } from "react";

interface BookmarkState {
  inBookmark: boolean;
  bookmarkLines: string[];
}

export const parseBookmark = (
  line: string,
  state: BookmarkState,
  index: number,
  BookmarkBlock: any,
): {
  element?: JSX.Element;
  shouldReturn: boolean;
  newState: BookmarkState;
} => {
  if (line.trim() === '<div class="bookmark">') {
    return {
      shouldReturn: true,
      newState: {
        inBookmark: true,
        bookmarkLines: [line],
      },
    };
  }

  if (state.inBookmark) {
    const newBookmarkLines = [...state.bookmarkLines, line];

    if (line.trim() === "</div>") {
      const bookmarkHtml = newBookmarkLines.join("\n");
      const urlMatch = bookmarkHtml.match(/href="([^"]+)"/);
      const titleMatch = bookmarkHtml.match(
        /<div class="bookmark-title">([^<]+)<\/div>/,
      );

      if (urlMatch) {
        const url = urlMatch[1];
        const title =
          titleMatch?.[1] || new URL(url).hostname.replace("www.", "");

        return {
          element: (
            <BookmarkBlock key={`bookmark-${index}`} url={url} title={title} />
          ),
          shouldReturn: true,
          newState: {
            inBookmark: false,
            bookmarkLines: [],
          },
        };
      }

      return {
        shouldReturn: true,
        newState: {
          inBookmark: false,
          bookmarkLines: [],
        },
      };
    }

    return {
      shouldReturn: true,
      newState: {
        ...state,
        bookmarkLines: newBookmarkLines,
      },
    };
  }

  return { shouldReturn: false, newState: state };
};
