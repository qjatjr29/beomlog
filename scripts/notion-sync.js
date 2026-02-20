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

  if (blockId) {
    url += `?table=block&id=${blockId}&cache=v2`;
  }
  return url;
};

/**
 * S3 URL을 notion.so/image/ 형식으로 변환합니다.
 */
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
      aspectRatio: result.height > 0 ? result.width / result.height : 1,
    };

    imageMetadataCache.set(url, metadata);
    console.log(`  📐 이미지 크기: ${metadata.width}x${metadata.height}`);
    return metadata;
  } catch (error) {
    console.warn(`  ⚠️ 이미지 메타데이터 가져오기 실패: ${error.message}`);
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
  return text.replace(/"/g, '\\"').replace(/\n/g, " ");
}

// ========================================
// 🔥 블록을 Markdown으로 변환 (재귀)
// ========================================

let numberedListCounter = 0;
let lastBlockType = null;

function extractExcerptFromContent(content, maxLength = 100) {
  const plainText = content
    .replace(/```[\s\S]*?```/g, "") // 코드블록 제거
    .replace(/!\[.*?\]\(.*?\)/g, "") // 이미지 제거
    .replace(/<[^>]+>/g, "") // HTML 태그 제거
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // 링크 → 텍스트만
    .replace(/#{1,6}\s/g, "") // 헤더 마크 제거
    .replace(/[*_~`>]/g, "") // 강조/인용 마크 제거
    .replace(/^\s*[-*+]\s/gm, "") // 리스트 마크 제거
    .replace(/^\s*\d+\.\s/gm, "") // 번호 리스트 마크 제거
    .replace(/\n+/g, " ") // 개행 → 공백
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
      markdown = `## ${text}\n\n`;
      break;
    }

    case "heading_3": {
      const text = processRichText(block.heading_3.rich_text);
      markdown = `### ${text}\n\n`;
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
      markdown = `> ${text}\n\n`;
      break;
    }

    case "callout": {
      const icon = block.callout.icon?.emoji || "💡";
      const text = processRichText(block.callout.rich_text);

      let content = text;
      if (block.has_children) {
        const children = await getBlockChildren(block.id);
        for (const child of children) {
          const childText = await blockToMarkdown(child, depth + 1);
          if (childText.trim()) {
            content += "\n" + childText.trim();
          }
        }
      }

      const lines = content
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      markdown = `> ${icon}\n${lines}\n\n`;
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
  return {
    lastSyncTime: null,
    processedPages: {},
  };
}

function saveSyncState(state) {
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

async function syncNotionPosts() {
  try {
    console.log("📚 Notion 동기화 시작...\n");

    const syncState = loadSyncState();
    const lastSyncTime = syncState.lastSyncTime
      ? new Date(syncState.lastSyncTime)
      : null;

    if (lastSyncTime) {
      console.log(`⏰ 마지막 동기화: ${lastSyncTime.toLocaleString("ko-KR")}`);
    } else {
      console.log("🆕 첫 동기화입니다. 모든 포스트를 가져옵니다.");
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });

    const dataSourceId = database.data_sources[0].id;
    console.log(`📊 Data Source ID: ${dataSourceId}\n`);

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: "Published",
        checkbox: { equals: true },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    console.log(`✅ ${response.results.length}개의 공개 포스트를 찾았습니다.`);

    const currentSyncTime = new Date();
    const currentPageIds = new Set();
    const updatedPages = {};
    const categoryCount = {};
    const postsMetadata = [];

    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const page of response.results) {
      currentPageIds.add(page.id);

      const pageLastEdited = new Date(page.last_edited_time);
      const cachedPage = syncState.processedPages[page.id];

      const isNew = !cachedPage;
      const isUpdated =
        cachedPage && new Date(cachedPage.lastEdited) < pageLastEdited;

      if (!isNew && !isUpdated) {
        skippedCount++;

        try {
          const properties = page.properties;
          const title = getPlainText(properties.Title?.title) || "Untitled";
          const slug =
            getPlainText(properties.Slug?.rich_text) || slugify(title);
          const category = properties.Category?.select?.name || "uncategorized";
          const tags =
            properties.Tags?.multi_select?.map((tag) => tag.name) || [];
          const date =
            properties.Date?.date?.start ||
            new Date().toISOString().split("T")[0];
          const excerpt = getPlainText(properties.Excerpt?.rich_text) || "";
          const categorySlug = slugify(category);

          postsMetadata.push({
            id: page.id,
            title,
            slug,
            category,
            categorySlug,
            tags,
            date,
            excerpt,
            path: `${categorySlug}/${slug}.md`,
            lastEdited: page.last_edited_time,
          });
        } catch (error) {
          console.warn(
            `⚠️ 메타데이터 추출 실패 (ID: ${page.id}):`,
            error.message,
          );
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

        categoryCount[postData.category] =
          (categoryCount[postData.category] || 0) + 1;

        if (isNew) {
          newCount++;
          console.log(`  🆕 새 포스트`);
        } else {
          updatedCount++;
          console.log(`  🔄 업데이트됨`);
        }
      } catch (error) {
        console.error(`❌ 포스트 처리 실패 (ID: ${page.id}):`, error.message);
      }
    }

    const deletedPageIds = Object.keys(syncState.processedPages).filter(
      (id) => !currentPageIds.has(id),
    );

    if (deletedPageIds.length > 0) {
      console.log(`\n🗑️  ${deletedPageIds.length}개의 삭제된 포스트 감지`);
      for (const pageId of deletedPageIds) {
        try {
          const { slug, categorySlug } = syncState.processedPages[pageId];
          const filePath = path.join(OUTPUT_DIR, categorySlug, `${slug}.md`);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`  ✅ 삭제됨: ${categorySlug}/${slug}.md`);
          }

          delete syncState.processedPages[pageId];
        } catch (error) {
          console.error(`❌ 파일 삭제 실패 (ID: ${pageId}):`, error.message);
        }
      }
    }

    const metadataPath = path.join(OUTPUT_DIR, "posts.json");
    postsMetadata.sort((a, b) => new Date(b.date) - new Date(a.date));
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(postsMetadata, null, 2),
      "utf-8",
    );
    console.log(
      `\n📋 posts.json 업데이트 (총 ${postsMetadata.length}개 포스트)`,
    );

    saveSyncState({
      lastSyncTime: currentSyncTime.toISOString(),
      processedPages: {
        ...syncState.processedPages,
        ...updatedPages,
      },
    });

    console.log("\n📊 동기화 통계:");
    console.log(`  🆕 새 포스트: ${newCount}개`);
    console.log(`  🔄 업데이트: ${updatedCount}개`);
    console.log(`  ⏭️  변경 없음: ${skippedCount}개`);
    console.log(`  🗑️  삭제됨: ${deletedPageIds.length}개`);

    if (Object.keys(categoryCount).length > 0) {
      console.log("\n📂 카테고리별 처리된 포스트:");
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}개`);
      });
    }

    console.log("\n🎉 동기화 완료!");
  } catch (error) {
    console.error("❌ 동기화 실패:", error);
    process.exit(1);
  }
}

async function processPost(page) {
  const properties = page.properties;
  const id = page.id;
  const title = getPlainText(properties.Title?.title) || "Untitled";
  const slug = getPlainText(properties.Slug?.rich_text) || slugify(title);
  const category = properties.Category?.select?.name || "uncategorized";
  const tags = properties.Tags?.multi_select?.map((tag) => tag.name) || [];
  const date =
    properties.Date?.date?.start || new Date().toISOString().split("T")[0];

  const content = await getPageContent(page.id);
  const rawExcerpt = getPlainText(properties.Excerpt?.rich_text);
  const excerpt = rawExcerpt || extractExcerptFromContent(content);

  console.log(`📝 처리 중: ${category}/${slug}`);

  const frontMatter = `---
id: "${id}"
title: "${escapeYaml(title)}"
slug: "${slug}"
category: "${category}"
tags: ${JSON.stringify(tags)}
date: "${date}"
excerpt: "${escapeYaml(excerpt)}"
lastEdited: "${page.last_edited_time}"
---

${content}`;

  const categorySlug = slugify(category);
  const categoryDir = path.join(OUTPUT_DIR, categorySlug);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const filePath = path.join(categoryDir, `${slug}.md`);
  fs.writeFileSync(filePath, frontMatter, "utf-8");

  return {
    id,
    title,
    slug,
    category,
    categorySlug,
    tags,
    date,
    excerpt,
    path: `${categorySlug}/${slug}.md`,
    lastEdited: page.last_edited_time,
  };
}

syncNotionPosts();
