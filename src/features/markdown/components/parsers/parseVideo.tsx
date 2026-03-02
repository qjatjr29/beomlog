import { JSX } from "react";
import { VideoBlock } from "../blocks/VideoBlock";

// sync 스크립트에서 이런 형식으로 저장됨:
// <video-block src="..." caption="..." type="youtube" videoId="abc123"></video-block>
// 또는 직접 업로드:
// <video-block src="https://..." caption="..." type="file"></video-block>

export const parseVideoBlock = (
  line: string,
  index: number,
): JSX.Element | null => {
  const match = line.match(/^<video-block\s+([^>]+)><\/video-block>$/);
  if (!match) return null;

  const attrs = match[1];
  const src = attrs.match(/src="([^"]+)"/)?.[1] ?? "";
  const caption = attrs.match(/caption="([^"]+)"/)?.[1] ?? "";
  const type = (attrs.match(/type="([^"]+)"/)?.[1] ?? "external") as
    | "youtube"
    | "vimeo"
    | "file"
    | "external";
  const videoId = attrs.match(/videoId="([^"]+)"/)?.[1];

  return (
    <VideoBlock
      key={`video-${index}`}
      url={src}
      caption={caption}
      type={type}
      videoId={videoId}
    />
  );
};
