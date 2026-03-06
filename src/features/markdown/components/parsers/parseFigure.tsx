import { JSX } from "react";

type FigureState = { inFigure: boolean; figureLines: string[] };

type FigureResult = {
  element: JSX.Element | null;
  handled: boolean;
  state: FigureState;
};

export const parseFigure = (
  line: string,
  index: number,
  state: FigureState,
): FigureResult => {
  if (line.trim() === "<figure>") {
    return {
      element: null,
      handled: true,
      state: { inFigure: true, figureLines: [] },
    };
  }

  if (state.inFigure) {
    if (line.trim() === "</figure>") {
      const imgLine = state.figureLines.find((l) =>
        l.trim().startsWith("<img"),
      );
      const captionMatch = state.figureLines
        .find((l) => l.trim().startsWith("<figcaption>"))
        ?.match(/<figcaption>(.*?)<\/figcaption>/);

      const caption = captionMatch?.[1] ?? "";
      const srcMatch = imgLine?.match(/src="([^"]+)"/);
      const widthMatch = imgLine?.match(/width="([^"]+)"/);
      const heightMatch = imgLine?.match(/height="([^"]+)"/);

      if (!srcMatch) {
        return {
          element: null,
          handled: true,
          state: { inFigure: false, figureLines: [] },
        };
      }

      return {
        element: (
          <figure key={`figure-${index}`} className="my-6">
            <img
              src={srcMatch[1]}
              alt={caption}
              width={widthMatch ? Number(widthMatch[1]) : undefined}
              height={heightMatch ? Number(heightMatch[1]) : undefined}
              loading="lazy"
              className="rounded-lg w-full"
            />
            {caption && (
              <figcaption className="text-center text-xs text-gray-400 mt-2">
                {caption}
              </figcaption>
            )}
          </figure>
        ),
        handled: true,
        state: { inFigure: false, figureLines: [] },
      };
    }

    return {
      element: null,
      handled: true,
      state: { inFigure: true, figureLines: [...state.figureLines, line] },
    };
  }

  return { element: null, handled: false, state: state };
};
