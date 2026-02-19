import { JSX } from "react";

export const parseInlineLink = (
  line: string,
  index: number,
  InlineLink: any,
): JSX.Element | null => {
  const inlineLinkMatch = line.match(
    /^<span class="inline-link" data-url="([^"]+)" data-domain="([^"]+)"><\/span>$/,
  );

  if (!inlineLinkMatch) return null;

  const url = inlineLinkMatch[1];
  const domain = inlineLinkMatch[2];

  return <InlineLink key={`inline-link-${index}`} url={url} domain={domain} />;
};
