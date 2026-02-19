import { JSX } from "react";

export const parseHtmlImage = (
  line: string,
  index: number,
  ImageBlock: any,
): JSX.Element | null => {
  const htmlImgMatch = line.match(/^<img\s+([^>]+)>$/);
  if (!htmlImgMatch) return null;

  const attributes = htmlImgMatch[1];
  const srcMatch = attributes.match(/src="([^"]+)"/);
  const altMatch = attributes.match(/alt="([^"]+)"/);
  const widthMatch = attributes.match(/width="(\d+)"/);
  const heightMatch = attributes.match(/height="(\d+)"/);

  const src = srcMatch ? srcMatch[1] : "";
  const alt = altMatch ? altMatch[1] : "";
  const width = widthMatch ? widthMatch[1] : undefined;
  const height = heightMatch ? heightMatch[1] : undefined;

  return (
    <ImageBlock
      key={`html-img-${index}`}
      src={src}
      alt={alt}
      width={width}
      height={height}
    />
  );
};

export const parseMarkdownImage = (
  line: string,
  index: number,
  ImageBlock: any,
): JSX.Element | null => {
  const imageMatch = line.match(/^!\[([^\]]*)\]\(([^\)]+)\)$/);
  if (!imageMatch) return null;

  const alt = imageMatch[1];
  const url = imageMatch[2];

  return <ImageBlock key={`md-img-${index}`} src={url} alt={alt} />;
};
