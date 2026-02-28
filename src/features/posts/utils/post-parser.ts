import { PostFrontMatter } from "../types";

export const parsePostContent = (
  markdown: string,
): { frontMatter: PostFrontMatter; content: string } => {
  const FRONT_MATTER_REGEX =
    /^\s*---\s*\r?\n([\s\S]*?)\r?\n\s*---\s*\r?\n?([\s\S]*)$/;
  const match = markdown.match(FRONT_MATTER_REGEX);

  if (!match) {
    throw new Error("Invalid markdown format: Missing frontmatter");
  }

  const [_, frontMatterRaw, content] = match;
  const metadata: Partial<PostFrontMatter> = {};

  frontMatterRaw.split(/\r?\n/).forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    switch (key) {
      case "id":
      case "title":
      case "slug":
      case "excerpt":
      case "date":
      case "createdAt":
      case "category":
      case "lastEdited":
      case "groupId":
      case "coverImage":
      case "thumbnail":
        metadata[key] = cleanValue(value);
        break;
      case "tags":
        metadata.tags = parseYamlArray(value);
        break;
    }
  });

  return {
    frontMatter: metadata as PostFrontMatter,
    content: content.trim(),
  };
};

const cleanValue = (value: string): string => {
  return value.trim().replace(/^["']|["']$/g, "");
};

const parseYamlArray = (value: string): string[] => {
  const bracketMatch = value.match(/\[(.*?)\]/);
  if (!bracketMatch) return [];

  try {
    // JSON 형식이면 바로 파싱 (["a", "b"])
    return JSON.parse(`[${bracketMatch[1]}]`);
  } catch {
    // 아니면 쉼표 분리 (a, b)
    return bracketMatch[1]
      .split(",")
      .map((s) => cleanValue(s))
      .filter(Boolean);
  }
};

export const extractFilenameByPath = (filepath: string): string => {
  return filepath.split("/").pop() || "";
};

export const extractCategoryByPath = (
  filepath: string,
  frontMatter: PostFrontMatter,
) => {
  const pathParts = filepath.split("/");
  const categoryFromPath =
    pathParts.length > 4 ? pathParts[pathParts.length - 2] : null;

  const category = frontMatter.category || categoryFromPath || "uncategorized";
  const categorySlug = slugify(category);

  return { category, categorySlug };
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
