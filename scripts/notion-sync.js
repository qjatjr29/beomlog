import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import probe from "probe-image-size";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

/** Notion 이미지 프록시 기본 URL */
export const NOTION_IMAGE_BASE_URL = "https://www.notion.so/image/";
const imageMetadataCache = new Map();

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error("❌ 환경변수가 설정되지 않았습니다!");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const OUTPUT_DIR = path.join(__dirname, "../src/assets/posts");
const SYNC_STATE_FILE = path.join(__dirname, "../.notion-sync-state.json");

// ========================================
// 🎯 유틸리티 함수들
// ========================================

/** 유효한 https URL인지 확인 */
const isValidHttpsUrl = (url) =>
  typeof url === "string" && url.startsWith("https://");

/** 이미 notion.so 이미지 URL 형식인지 확인 */
const isNotionImageUrl = (url) => url.includes(NOTION_IMAGE_BASE_URL);

/** URL에서 쿼리 파라미터 제거 */
const removeQueryParams = (url) =>
  url.includes("?") ? (url.split("?")[0] ?? url) : url;

/** 노션 이미지 URL 조립 */
const buildNotionImageUrl = (encodedUrl, blockId) => {
  let url = `${NOTION_IMAGE_BASE_URL}${encodedUrl}`;
  if (blockId) url += `?table=block&id=${blockId}&cache=v2`;
  return url;
};

/** S3 URL을 notion.so/image/ 형식으로 변환합니다.*/
export const formatNotionImageUrl = (url, blockId) => {
  if (!isValidHttpsUrl(url)) return url ?? "";
  if (isNotionImageUrl(url)) return url;
  try {
    const baseUrl = removeQueryParams(url);
    return buildNotionImageUrl(encodeURIComponent(baseUrl), blockId);
  } catch {
    return url;
  }
};

// 이미지 메타데이터 가져오기 함수
async function getImageMetadata(url) {
  // 캐시 확인
  if (imageMetadataCache.has(url)) {
    return imageMetadataCache.get(url);
  }
  try {
    const result = await probe(url);
    const metadata = {
      width: result.width,
      height: result.height,
      // aspectRatio: result.height > 0 ? result.width / result.height : 1,
    };

    imageMetadataCache.set(url, metadata);
    // console.log(`  📐 이미지 크기: ${metadata.width}x${metadata.height}`);
    return metadata;
  } catch (error) {
    // console.warn(`  ⚠️ 이미지 메타데이터 가져오기 실패: ${error.message}`);
    imageMetadataCache.set(url, null);
    return null;
  }
}

function processRichText(richTextArray) {
  return richTextArray
    .map((text) => {
      let content = text.plain_text;
      const { annotations } = text;

      if (annotations.code) content = `\`${content}\``;
      if (annotations.bold) content = `**${content}**`;
      if (annotations.italic) content = `*${content}*`;
      if (annotations.strikethrough) content = `~~${content}~~`;
      if (annotations.underline) content = `<u>${content}</u>`;

      if (annotations.color && annotations.color !== "default") {
        const colorClass = `text-${annotations.color}`;
        content = `<span class="${colorClass}">${content}</span>`;
      }

      return content;
    })
    .join("");
}

function getPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map((text) => text.plain_text).join("");
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeYaml(text) {
  return (text || "").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function extractCoverImage(page) {
  if (!page.cover) return "";
  if (page.cover.type === "external") return page.cover.external.url;
  if (page.cover.type === "file") {
    return formatNotionImageUrl(page.cover.file.url, page.id);
  }
  return "";
}

// ========================================
// 🔥 블록을 Markdown으로 변환 (재귀)
// ========================================

let numberedListCounter = 0;
let lastBlockType = null;

function extractExcerptFromContent(content, maxLength = 100) {
  const plainText = content
    // 1. 코드블록 제거 (``` ... ```)
    .replace(/```[\s\S]*?```/g, "")

    // 2. 테이블 제거 (| --- | 형식의 행들)
    .replace(/^\|.*\|$/gm, "")

    // 3. HTML img 태그 제거 (<img ... />)
    .replace(/<img[^>]*\/>/g, "")

    // 4. inline-link span 제거
    .replace(/<span class="inline-link"[^>]*><\/span>/g, "")

    // 5. details/summary 블록 제거 (toggle)
    .replace(/<details>[\s\S]*?<\/details>/g, "")

    // 6. bookmark div 제거
    .replace(/<div class="bookmark">[\s\S]*?<\/div>/g, "")

    // 7. 나머지 HTML 태그 제거 (<u>, <span>, 등)
    .replace(/<[^>]+>/g, "")

    // 8. 마크다운 이미지 제거 (![...](...)  )
    .replace(/!\[.*?\]\(.*?\)/g, "")

    // 9. 마크다운 링크 → 텍스트만 ([text](url))
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")

    // 10. 헤더 마크 제거 (# ## ###)
    .replace(/#{1,6}\s/g, "")

    // 11. 수평선 제거 (---)
    .replace(/^---+$/gm, "")

    // 12. 강조/인용 마크 제거 (** * ~~ ` >)
    .replace(/[*_~`>]/g, "")

    // 13. 인라인 코드 제거 (`code`)  - 이미 ` 제거로 처리되나 명시적으로
    .replace(/`[^`]+`/g, "")

    // 14. 순서없는 리스트 마크 제거 (- * +)
    .replace(/^\s*[-*+]\s/gm, "")

    // 15. 순서있는 리스트 마크 제거 (1. 2.)
    .replace(/^\s*\d+\.\s/gm, "")

    // 16. 빈 줄 / 연속 공백 정리
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + "..."
    : plainText;
}

async function blockToMarkdown(block, depth = 0) {
  const type = block.type;

  // 리스트 카운터 관리
  if (type !== "numbered_list_item" && lastBlockType === "numbered_list_item") {
    numberedListCounter = 0;
  }
  lastBlockType = type;

  let markdown = "";

  switch (type) {
    case "paragraph": {
      const text = processRichText(block.paragraph.rich_text);

      if (!text) {
        markdown = "\n"; // 빈 paragraph → 빈 줄로 보존
        break;
      }
      const urlMatch = text.trim().match(/^(https?:\/\/[^\s]+)$/);

      if (urlMatch) {
        const url = urlMatch[1];
        try {
          const urlObj = new URL(url);
          const domain = urlObj.hostname.replace("www.", "");

          markdown = `<span class="inline-link" data-url="${url}" data-domain="${domain}"></span>\n`;
        } catch (e) {
          markdown = text ? `${text}\n` : "";
        }
      } else {
        markdown = text ? `${text}\n` : "";
      }
      break;
    }

    case "heading_1": {
      const text = processRichText(block.heading_1.rich_text);
      markdown = `# ${text}\n\n`;
      break;
    }

    case "heading_2": {
      const text = processRichText(block.heading_2.rich_text);
      markdown = `## ${text}\n`;
      break;
    }

    case "heading_3": {
      const text = processRichText(block.heading_3.rich_text);
      markdown = `### ${text}\n`;
      break;
    }

    case "bulleted_list_item": {
      const text = processRichText(block.bulleted_list_item.rich_text);
      markdown = `- ${text}\n`;

      if (block.has_children) {
        const children = await getBlockChildren(block.id);
        for (const child of children) {
          const childMd = await blockToMarkdown(child, depth + 1);
          markdown += `  ${childMd}`;
        }
      }
      break;
    }

    case "numbered_list_item": {
      numberedListCounter++;
      const text = processRichText(block.numbered_list_item.rich_text);
      markdown = `${numberedListCounter}. ${text}\n`;

      if (block.has_children) {
        const children = await getBlockChildren(block.id);
        for (const child of children) {
          const childMd = await blockToMarkdown(child, depth + 1);
          markdown += `  ${childMd}`;
        }
      }
      break;
    }

    case "toggle": {
      const summary = processRichText(block.toggle.rich_text);
      let content = "";

      if (block.has_children) {
        const children = await getBlockChildren(block.id);
        for (const child of children) {
          content += await blockToMarkdown(child, depth + 1);
        }
      }

      content = content.trim();
      markdown = `<details>\n<summary>${summary}</summary>\n\n${content}\n\n</details>\n\n`;
      break;
    }
    case "quote": {
      const text = processRichText(block.quote.rich_text);

      // 자식 블록(하위 리스트 등)이 있는지 확인하고 마크다운으로 변환
      let childrenMd = "";
      if (block.has_children) {
        const children = await getBlockChildren(block.id);
        for (const child of children) {
          const childMd = await blockToMarkdown(child, depth + 1);
          if (childMd) {
            const lines = childMd.split("\n");
            // split("\n")으로 인해 마지막에 생기는 불필요한 빈 배열 요소 제거
            if (lines[lines.length - 1] === "") lines.pop();

            // 자식 블록의 각 줄 앞에 "> " 를 붙여서 들여쓰기 유지
            const indented = lines
              .map((l) => (l.trim() ? `> ${l}` : ">"))
              .join("\n");
            childrenMd += indented + "\n";
          }
        }
      }

      markdown = `> ${text}\n${childrenMd}\n`;
      break;
    }

    case "callout": {
      const icon = block.callout.icon?.emoji || null;
      const text = processRichText(block.callout.rich_text);

      let childrenMd = "";
      if (block.has_children) {
        const children = await getBlockChildren(block.id);
        for (const child of children) {
          const childMd = await blockToMarkdown(child, depth + 1);
          if (childMd) {
            const lines = childMd.split("\n");
            if (lines[lines.length - 1] === "") lines.pop();

            const indented = lines
              .map((l) => (l.trim() ? `> ${l}` : ">"))
              .join("\n");
            childrenMd += indented + "\n";
          }
        }
      }

      const firstLine = icon ? `> ${icon} ${text}` : `> ${text}`;
      markdown = `${firstLine}\n${childrenMd}\n`;
      break;
    }

    case "code": {
      const code = getPlainText(block.code.rich_text);
      const language = block.code.language || "";
      markdown = `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
      break;
    }

    case "image": {
      let url = "";
      let caption = "";

      if (block.image.type === "file") {
        url = block.image.file.url;
      } else if (block.image.type === "external") {
        url = block.image.external.url;
      }

      // 🎯 이미지 URL을 Notion 프록시 URL로 변환
      const formattedUrl = formatNotionImageUrl(url, block.id);

      // 🎯 이미지 메타데이터 가져오기
      const metadata = await getImageMetadata(url);

      if (block.image.caption && block.image.caption.length > 0) {
        caption = getPlainText(block.image.caption);
      }

      // 🎯 메타데이터가 있으면 HTML img 태그 사용
      if (metadata) {
        markdown = `<img src="${formattedUrl}" alt="${caption || "image"}" width="${metadata.width}" height="${metadata.height}" loading="lazy" />\n\n`;
      } else {
        // 메타데이터 없으면 기본 마크다운
        markdown = `![${caption || "image"}](${formattedUrl})\n\n`;
      }
      break;
    }

    case "divider": {
      markdown = `---\n\n`;
      break;
    }

    case "table": {
      const rows = await getBlockChildren(block.id);

      if (rows.length > 0) {
        markdown = "\n";
        rows.forEach((row, rowIndex) => {
          if (row.type === "table_row") {
            const cells = row.table_row.cells;
            const processedCells = cells.map((cell) => processRichText(cell));
            markdown += `| ${processedCells.join(" | ")} |\n`;

            if (rowIndex === 0) {
              markdown += `| ${cells.map(() => "----").join(" | ")} |\n`;
            }
          }
        });
        markdown += "\n";
      }
      break;
    }

    case "bookmark": {
      const url = block.bookmark.url;
      const domain = new URL(url).hostname.replace("www.", "");
      markdown = `<div class="bookmark">
  <a href="${url}" target="_blank" rel="noopener noreferrer">
    <div class="bookmark-title">${domain}</div>
    <div class="bookmark-url">${url}</div>
  </a>
</div>\n\n`;
      break;
    }

    case "link_preview": {
      const url = block.link_preview.url;
      markdown = `[${url}](${url})\n\n`;
      break;
    }

    case "table_of_contents": {
      markdown = `<!-- TOC -->\n\n`;
      break;
    }

    default: {
      console.warn(`⚠️ 지원하지 않는 블록 타입: ${type}`);
      break;
    }
  }

  return markdown;
}

async function getBlockChildren(blockId) {
  const allResults = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    allResults.push(...response.results);

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return allResults;
}

async function getChildPages(pageId) {
  const allResults = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      start_cursor: cursor,
    });

    // child_page 타입만 필터링
    const childPages = response.results.filter(
      (block) => block.type === "child_page",
    );
    allResults.push(...childPages);

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return allResults;
}

async function getPageContent(pageId) {
  const blocks = await getBlockChildren(pageId);

  numberedListCounter = 0;
  lastBlockType = null;

  let markdown = "";
  for (const block of blocks) {
    markdown += await blockToMarkdown(block);
  }

  return markdown;
}

// ========================================
// 🔧 동기화 로직
// ========================================

function loadSyncState() {
  try {
    if (fs.existsSync(SYNC_STATE_FILE)) {
      const data = fs.readFileSync(SYNC_STATE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("⚠️ 이전 동기화 상태를 불러올 수 없습니다:", error.message);
  }
  return { lastSyncTime: null, processedPages: {} };
}

function saveSyncState(state) {
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

async function getAllPublishedPages() {
  const allResults = [];
  let cursor = undefined;
  while (true) {
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });

    const dataSourceId = database.data_sources[0].id;

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: 100,
      start_cursor: cursor,
    });
    allResults.push(...response.results);
    if (!response.has_more) break;
    cursor = response.next_cursor;
  }
  return allResults;
}

async function syncNotionPosts() {
  try {
    console.log("📚 Notion 동기화 시작...\n");

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const syncState = loadSyncState();
    const allPages = await getAllPublishedPages();
    console.log(`✅ 총 ${allPages.length}개 Published 페이지 발견\n`);

    // ── 그룹 페이지 / 일반 글 분리 ──
    const groupPages = allPages.filter(
      (p) => p.properties.IsGroup?.checkbox === true,
    );
    const normalPostPages = allPages.filter(
      (p) => p.properties.IsGroup?.checkbox !== true,
    );

    console.log(`📁 그룹 페이지: ${groupPages.length}개`);
    console.log(`📝 일반 글: ${normalPostPages.length}개\n`);
    const currentSyncTime = new Date();
    // 현재 유효한 페이지 ID 추적 (그룹 + 일반 + 하위 페이지)
    const currentPageIds = new Set(allPages.map((p) => p.id));
    const updatedPages = {};
    const postsMetadata = [];
    const groupsMetadata = [];
    let newCount = 0,
      updatedCount = 0,
      skippedCount = 0;

    // ── 그룹 페이지 처리 ──────────────────────────────────
    for (const groupPage of groupPages) {
      const props = groupPage.properties;
      const groupTitle = getPlainText(props.Title?.title) || "Untitled";
      const category = props.Category?.select?.name || "uncategorized";
      const coverImage = extractCoverImage(groupPage);
      const description = getPlainText(props.Description?.rich_text) || "";

      console.log(`\n📁 그룹 처리: [${category}] ${groupTitle}`);

      const groupMeta = {
        id: groupPage.id,
        title: groupTitle,
        category,
        categorySlug: slugify(category),
        coverImage,
        description,
        postCount: 0,
        lastEdited: groupPage.last_edited_time,
      };
      groupsMetadata.push(groupMeta);

      // 하위 페이지 목록 가져오기
      const childPages = await getChildPages(groupPage.id);
      console.log(`  └─ 하위 페이지 ${childPages.length}개 발견`);

      for (const childBlock of childPages) {
        const childTitle = childBlock.child_page.title || "Untitled";

        // [draft] prefix 스킵
        if (childTitle.toLowerCase().startsWith("[draft]")) {
          console.log(`  ⏭️  스킵 (draft): ${childTitle}`);
          continue;
        }

        currentPageIds.add(childBlock.id); // 유효 ID에 추가

        const cachedPage = syncState.processedPages[childBlock.id];
        const pageLastEdited = new Date(childBlock.last_edited_time ?? 0);
        const isNew = !cachedPage;
        const isUpdated =
          cachedPage && new Date(cachedPage.lastEdited) < pageLastEdited;

        if (!isNew && !isUpdated) {
          skippedCount++;
          // 캐시에서 메타데이터 복원
          if (cachedPage) {
            postsMetadata.push({
              id: childBlock.id,
              title: childTitle,
              slug: cachedPage.slug,
              category,
              categorySlug: slugify(category),
              tags: cachedPage.tags ?? [],
              date:
                cachedPage.date ?? groupPage.last_edited_time?.split("T")[0],
              excerpt: cachedPage.excerpt ?? "",
              groupId: groupPage.id,
              path: `${slugify(category)}/${cachedPage.slug}.md`,
              lastEdited: childBlock.last_edited_time,
            });
            groupMeta.postCount++;
          }
          continue;
        }

        try {
          const postData = await processChildPost(
            childBlock.id,
            childTitle,
            category,
            groupPage.id,
            groupPage.last_edited_time,
          );
          postsMetadata.push(postData);
          groupMeta.postCount++;

          updatedPages[childBlock.id] = {
            slug: postData.slug,
            categorySlug: postData.categorySlug,
            tags: postData.tags,
            date: postData.date,
            excerpt: postData.excerpt,
            lastEdited:
              childBlock.last_edited_time ?? currentSyncTime.toISOString(),
          };

          if (isNew) {
            newCount++;
            console.log(`  🆕 새 글: ${postData.slug}`);
          } else {
            updatedCount++;
            console.log(`  🔄 업데이트: ${postData.slug}`);
          }
        } catch (e) {
          console.error(`  ❌ 처리 실패 (${childTitle}):`, e.message);
        }
      }
    }

    // ── 일반 글 처리 (기존과 동일) ───────────────────────
    for (const page of normalPostPages) {
      const pageLastEdited = new Date(page.last_edited_time);
      const cachedPage = syncState.processedPages[page.id];
      const isNew = !cachedPage;
      const isUpdated =
        cachedPage && new Date(cachedPage.lastEdited) < pageLastEdited;

      if (!isNew && !isUpdated) {
        skippedCount++;
        try {
          const props = page.properties;
          const title = getPlainText(props.Title?.title) || "Untitled";
          const slug = getPlainText(props.Slug?.rich_text) || slugify(title);
          const category = props.Category?.select?.name || "uncategorized";
          const tags = props.Tags?.multi_select?.map((t) => t.name) || [];
          const date =
            props.Date?.date?.start || new Date().toISOString().split("T")[0];
          const excerpt = getPlainText(props.Excerpt?.rich_text) || "";

          postsMetadata.push({
            id: page.id,
            title,
            slug,
            category,
            categorySlug: slugify(category),
            tags,
            date,
            excerpt,
            groupId: "",
            path: `${slugify(category)}/${slug}.md`,
            lastEdited: page.last_edited_time,
          });
        } catch (e) {
          console.warn(`⚠️ 메타데이터 복원 실패 (ID: ${page.id}):`, e.message);
        }
        continue;
      }

      try {
        const postData = await processPost(page);
        postsMetadata.push(postData);
        updatedPages[page.id] = {
          slug: postData.slug,
          categorySlug: postData.categorySlug,
          lastEdited: page.last_edited_time,
        };
        if (isNew) {
          newCount++;
          console.log(`🆕 새 포스트: ${postData.slug}`);
        } else {
          updatedCount++;
          console.log(`🔄 업데이트: ${postData.slug}`);
        }
      } catch (e) {
        console.error(`❌ 처리 실패 (ID: ${page.id}):`, e.message);
      }
    }

    // ── 삭제된 페이지 처리 ──
    const deletedIds = Object.keys(syncState.processedPages).filter(
      (id) => !currentPageIds.has(id),
    );
    for (const pageId of deletedIds) {
      try {
        const cached = syncState.processedPages[pageId];
        const filePath = path.join(
          OUTPUT_DIR,
          cached.categorySlug,
          `${cached.slug}.md`,
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  삭제: ${cached.categorySlug}/${cached.slug}.md`);
        }
      } catch (e) {
        console.error(`❌ 삭제 실패 (ID: ${pageId}):`, e.message);
      }
    }

    // ── JSON 저장 ──
    postsMetadata.sort((a, b) => new Date(b.date) - new Date(a.date));
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "posts.json"),
      JSON.stringify(postsMetadata, null, 2),
      "utf-8",
    );
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "groups.json"),
      JSON.stringify(groupsMetadata, null, 2),
      "utf-8",
    );

    console.log(`\n📋 posts.json (${postsMetadata.length}개)`);
    console.log(`📋 groups.json (${groupsMetadata.length}개 그룹)`);

    saveSyncState({
      lastSyncTime: currentSyncTime.toISOString(),
      processedPages: { ...syncState.processedPages, ...updatedPages },
    });

    console.log(
      `\n📊 완료: 새 ${newCount} / 업데이트 ${updatedCount} / 스킵 ${skippedCount} / 삭제 ${deletedIds.length}`,
    );
  } catch (e) {
    console.error("❌ 동기화 실패:", e);
    process.exit(1);
  }
}

async function processChildPost(
  pageId,
  title,
  category,
  groupId,
  groupLastEdited,
) {
  const slug = slugify(title);
  const categorySlug = slugify(category);

  const content = await getPageContent(pageId);
  const excerpt = extractExcerptFromContent(content);
  const date =
    groupLastEdited?.split("T")[0] ?? new Date().toISOString().split("T")[0];

  const categoryDir = path.join(OUTPUT_DIR, categorySlug);
  if (!fs.existsSync(categoryDir))
    fs.mkdirSync(categoryDir, { recursive: true });

  const frontMatter = `---
id: "${pageId}"
title: "${escapeYaml(title)}"
slug: "${slug}"
category: "${category}"
tags: []
date: "${date}"
excerpt: "${escapeYaml(excerpt)}"
groupId: "${groupId}"
lastEdited: "${new Date().toISOString()}"
---

${content}`;

  fs.writeFileSync(path.join(categoryDir, `${slug}.md`), frontMatter, "utf-8");
  console.log(`  📝 저장: ${categorySlug}/${slug}`);

  return {
    id: pageId,
    title,
    slug,
    category,
    categorySlug,
    tags: [],
    date,
    excerpt,
    groupId,
    path: `${categorySlug}/${slug}.md`,
    lastEdited: new Date().toISOString(),
  };
}

async function processPost(page) {
  const props = page.properties;
  const id = page.id;
  const title = getPlainText(props.Title?.title) || "Untitled";
  const slug = getPlainText(props.Slug?.rich_text) || slugify(title);
  const category = props.Category?.select?.name || "uncategorized";
  const tags = props.Tags?.multi_select?.map((t) => t.name) || [];
  const date =
    props.Date?.date?.start || new Date().toISOString().split("T")[0];
  const groupId = getPlainText(props.GroupId?.rich_text) || "";

  const content = await getPageContent(page.id);
  const rawExcerpt = getPlainText(props.Excerpt?.rich_text);
  const excerpt = rawExcerpt || extractExcerptFromContent(content);

  const categorySlug = slugify(category);
  const categoryDir = path.join(OUTPUT_DIR, categorySlug);
  if (!fs.existsSync(categoryDir))
    fs.mkdirSync(categoryDir, { recursive: true });

  const frontMatter = `---
id: "${id}"
title: "${escapeYaml(title)}"
slug: "${slug}"
category: "${category}"
tags: ${JSON.stringify(tags)}
date: "${date}"
excerpt: "${escapeYaml(excerpt)}"
groupId: "${groupId}"
lastEdited: "${page.last_edited_time}"
---

${content}`;

  fs.writeFileSync(path.join(categoryDir, `${slug}.md`), frontMatter, "utf-8");
  console.log(`  📝 저장: ${categorySlug}/${slug}`);

  return {
    id,
    title,
    slug,
    category,
    categorySlug,
    tags,
    date,
    excerpt,
    groupId,
    path: `${categorySlug}/${slug}.md`,
    lastEdited: page.last_edited_time,
  };
}

syncNotionPosts();
