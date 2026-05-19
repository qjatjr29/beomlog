export const slugify = (text: string): string => {
  if (!text) return "";
  // remove HTML tags
  let s = text.replace(/<[^>]+>/g, "");
  // convert markdown links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  // remove code/backticks and emphasis markers
  s = s.replace(/[`*_~]/g, "");
  // keep korean, latin, numbers and spaces
  s = s.replace(/[^a-zA-Z0-9가-힣\s-]/g, "");
  s = s.trim().toLowerCase();
  s = s.replace(/\s+/g, "-");
  s = s.replace(/^-+|-+$/g, "");
  return s || "heading";
};

export default slugify;

/**
 * Clean heading text for display in the TOC: remove markdown markers and HTML tags
 */
export const cleanHeadingText = (text: string): string => {
  if (!text) return "";
  let s = text;
  // remove HTML tags
  s = s.replace(/<[^>]+>/g, "");
  // convert markdown links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  // remove emphasis/formatting markers: **, __, *, _, `, ~~, > blockquote markers
  s = s.replace(/\*\*|__|\*|_|`|~~|^>\s?/gm, "");
  // remove remaining markdown heading marks (#)
  s = s.replace(/^#{1,6}\s+/gm, "");
  // collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
};
