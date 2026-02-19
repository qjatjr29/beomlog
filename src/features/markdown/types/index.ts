import { CSSProperties } from "react";

export interface MarkdownRendererProps {
  content: string;
}

export interface CodeBlockProps {
  code: string;
  language: string;
}

export interface ToggleBlockProps {
  summary: string;
  content: string;
}

export interface BookmarkBlockProps {
  url: string;
  title: string;
}

export interface InlineLinkProps {
  url: string;
  domain: string;
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
}

export interface BlockquoteBlockProps {
  lines: string[];
}

export interface TableBlockProps {
  headers: string[];
  rows: string[][];
}

export interface InlinePattern {
  name: string;
  regex: RegExp;
}

export type ColorStyle = CSSProperties;
export type ColorName = string;
