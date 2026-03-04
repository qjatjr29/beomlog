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
const BLOG_URL = process.env.BLOG_URL || "https://www.xxxx.store";
const SITEMAP_PATH = path.join(__dirname, "../public/sitemap.xml");
// const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const DB_CONFIG = [
  { dbId: process.env.NOTION_DB_DEV, category: "개발", hasGroups: false },
  { dbId: process.env.NOTION_DB_DAILY, category: "일상", hasGroups: false },
  { dbId: process.env.NOTION_DB_BOOK, category: "책", hasGroups: true },
  {
    dbId: process.env.NOTION_DB_PROJECT,
    category: "프로젝트",
    hasGroups: true,
  },
];

/** Notion 이미지 프록시 기본 URL */
export const NOTION_IMAGE_BASE_URL = "https://www.notion.so/image/";
const imageMetadataCache = new Map();

if (!NOTION_TOKEN) {
  console.error("❌ 환경변수가 설정되지 않았습니다!");
  process.exit(1);
}

const missingDbs = DB_CONFIG.filter((c) => !c.dbId);
if (missingDbs.length > 0) {
  console.error(
    `❌ 누락된 DB 환경변수: ${missingDbs.map((c) => c.category).join(", ")}`,
  );
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
      markdown = `# ${text}\n`;
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
      const firstLine = icon ? `${icon} ${text}` : text;

      const childLines = [];
      if (block.has_children) {
        const children = await getBlockChildren(block.id);
        for (const child of children) {
          const childMd = await blockToMarkdown(child, depth + 1);
          // trailing newline 제거 후 각 줄을 분리
          childMd
            .trimEnd()
            .split("\n")
            .forEach((line) => {
              childLines.push(line);
            });
        }
      }

      const allLines = [firstLine, ...childLines];
      const quoted = allLines.map((line) => `> ${line}`).join("\n");
      markdown = `${quoted}\n`;
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

    case "video": {
      let url = "";
      let caption = "";
      let type = "external";
      let videoId = "";

      if (block.video.type === "file") {
        url = formatNotionImageUrl(block.video.file.url, block.id);
        type = "file";
      } else if (block.video.type === "external") {
        url = block.video.external.url;

        const youtubeMatch = url.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
        );
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

        if (youtubeMatch) {
          type = "youtube";
          videoId = youtubeMatch[1];
        } else if (vimeoMatch) {
          type = "vimeo";
          videoId = vimeoMatch[1];
        }
      }

      if (block.video.caption?.length > 0) {
        caption = getPlainText(block.video.caption);
      }

      markdown = `<video-block src="${url}" caption="${caption}" type="${type}"${videoId ? ` videoId="${videoId}"` : ""}></video-block>\n\n`;
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

function extractFirstImageFromContent(content) {
  // <img src="..." /> 형식
  const imgTagMatch = content.match(/<img[^>]+src="([^"]+)"/);
  if (imgTagMatch) return imgTagMatch[1];

  // ![alt](url) 형식
  const mdImageMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
  if (mdImageMatch) return mdImageMatch[1];

  return "";
}

function extractCoverImageFromProps(props, pageId) {
  const files = props.Thumbnail?.files;
  if (!files || files.length === 0) return "";

  const file = files[0];
  if (file.type === "file") return formatNotionImageUrl(file.file.url, pageId);
  if (file.type === "external") return file.external.url;
  return "";
}

// ── 그룹 페이지 내부 DB 찾기 ────────────────────

async function findInternalDatabase(groupPageId) {
  // 그룹 페이지의 블록 중 child_database 타입 찾기
  const blocks = await getBlockChildren(groupPageId);
  const dbBlock = blocks.find((b) => b.type === "child_database");
  if (!dbBlock) return null;
  return dbBlock.id; // 내부 DB의 ID
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

async function getPublishedPages(dbId) {
  const allResults = [];
  let cursor = undefined;
  while (true) {
    const database = await notion.databases.retrieve({
      database_id: dbId,
    });

    const dataSourceId = database.data_sources[0].id;

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      // filter: { property: "Status", select: { equals: "발행" } },
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

    if (!fs.existsSync(OUTPUT_DIR))
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const syncState = loadSyncState();
    const currentSyncTime = new Date();
    const currentPageIds = new Set();
    const updatedPages = {};
    const postsMetadata = [];
    const groupsMetadata = [];
    let newCount = 0,
      updatedCount = 0,
      skippedCount = 0;

    // ── 카테고리별 DB 순회 ─────────────────────────────────
    for (const { dbId, category, hasGroups } of DB_CONFIG) {
      console.log(`\n━━━ [${category}] DB 처리 중 ━━━`);

      const pages = await getPublishedPages(dbId);
      console.log(`  Published 페이지: ${pages.length}개`);

      // 모든 페이지 ID를 유효 ID에 등록
      pages.forEach((p) => currentPageIds.add(p.id));

      if (hasGroups) {
        // ── 그룹 카테고리 (책, 프로젝트) ──────────────────
        const groupPages = pages.filter(
          (p) => p.properties.IsGroup?.checkbox === true,
        );
        const normalPages = pages.filter(
          (p) => p.properties.IsGroup?.checkbox !== true,
        );

        console.log(
          `  그룹 페이지: ${groupPages.length}개 / 일반 글: ${normalPages.length}개`,
        );

        // 그룹 페이지 처리
        for (const groupPage of groupPages) {
          const props = groupPage.properties;
          const groupTitle = getPlainText(props.Title?.title) || "Untitled";
          const groupSlug = slugify(groupTitle);
          const coverImage = extractCoverImage(groupPage);
          const description = getPlainText(props.Description?.rich_text) || "";

          console.log(`\n  📁 그룹: ${groupTitle}`);

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

          // 내부 DB 찾기
          const internalDbId = await findInternalDatabase(groupPage.id);
          if (!internalDbId) {
            console.log(`    ⚠️  내부 DB 없음 - 스킵`);
            continue;
          }

          // 내부 DB 글 가져오기
          const dbPosts = await getPublishedPages(internalDbId);
          console.log(`    Published 글: ${dbPosts.length}개`);

          for (const page of dbPosts) {
            currentPageIds.add(page.id);

            const cachedPage = syncState.processedPages[page.id];
            const isNew = !cachedPage;
            const isUpdated =
              cachedPage &&
              new Date(cachedPage.lastEdited) < new Date(page.last_edited_time);

            if (!isNew && !isUpdated) {
              skippedCount++;
              if (cachedPage) {
                postsMetadata.push({
                  id: page.id,
                  title:
                    cachedPage.title ??
                    getPlainText(page.properties.Title?.title),
                  slug: cachedPage.slug,
                  category,
                  categorySlug: slugify(category),
                  // ✅ 그룹 슬러그 포함한 경로
                  groupSlug,
                  tags: cachedPage.tags ?? [],
                  date: cachedPage.date ?? page.last_edited_time.split("T")[0],
                  excerpt: cachedPage.excerpt ?? "",
                  groupId: groupPage.id,
                  path: `${slugify(category)}/${groupSlug}/${cachedPage.slug}.md`,
                  lastEdited: page.last_edited_time,
                });
                groupMeta.postCount++;
              }
              continue;
            }

            try {
              // ✅ 경로: 카테고리/그룹슬러그/글슬러그.md
              const postData = await processGroupPost(
                page,
                category,
                groupPage.id,
                groupSlug,
              );
              postsMetadata.push(postData);
              groupMeta.postCount++;
              updatedPages[page.id] = {
                slug: postData.slug,
                categorySlug: postData.categorySlug,
                groupSlug,
                title: postData.title,
                tags: postData.tags,
                date: postData.date,
                createdAt: postData.createdAt,
                thumbnail: postData.thumbnail,
                excerpt: postData.excerpt,
                lastEdited: page.last_edited_time,
              };
              if (isNew) {
                newCount++;
                console.log(`      🆕 새 글: ${postData.slug}`);
              } else {
                updatedCount++;
                console.log(`      🔄 업데이트: ${postData.slug}`);
              }
            } catch (e) {
              console.error(`      ❌ 처리 실패:`, e.message);
            }
          }
        }

        // 그룹 없는 일반 글도 처리 (책/프로젝트 DB에 IsGroup=false인 경우)
        for (const page of normalPages) {
          await processNormalPage(
            page,
            category,
            syncState,
            currentPageIds,
            postsMetadata,
            updatedPages,
            (isNew) => {
              if (isNew) newCount++;
              else updatedCount++;
            },
            () => skippedCount++,
          );
        }
      } else {
        // ── 일반 카테고리 (개발, 일상) ────────────────────
        for (const page of pages) {
          await processNormalPage(
            page,
            category,
            syncState,
            currentPageIds,
            postsMetadata,
            updatedPages,
            (isNew) => {
              if (isNew) newCount++;
              else updatedCount++;
            },
            () => skippedCount++,
          );
        }
      }
    }

    // ── 삭제된 페이지 처리 ────────────────────────────────
    const deletedIds = Object.keys(syncState.processedPages).filter(
      (id) => !currentPageIds.has(id),
    );
    for (const pageId of deletedIds) {
      try {
        const cached = syncState.processedPages[pageId];
        // ✅ 그룹 슬러그 있으면 하위 경로에서 삭제
        const filePath = cached.groupSlug
          ? path.join(
              OUTPUT_DIR,
              cached.categorySlug,
              cached.groupSlug,
              `${cached.slug}.md`,
            )
          : path.join(OUTPUT_DIR, cached.categorySlug, `${cached.slug}.md`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  삭제: ${filePath.replace(OUTPUT_DIR + "/", "")}`);
        }
      } catch (e) {
        console.error(`❌ 삭제 실패 (ID: ${pageId}):`, e.message);
      }
    }

    const totalChanges = newCount + updatedCount + deletedIds.length;

    if (totalChanges === 0) {
      console.log(
        "\n✅ 변경된 페이지가 없습니다. JSON 파일 업데이트 건너뜁니다.",
      );
      return; // 아무 파일도 덮어쓰지 않음
    }

    // ── JSON 저장 ──────────────────────────────────────────
    postsMetadata.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

    await generateSitemap(postsMetadata);

    // 삭제된 페이지는 상태(processedPages)에서도 완전히 지워주기!
    const nextProcessedPages = { ...syncState.processedPages, ...updatedPages };
    deletedIds.forEach((id) => {
      delete nextProcessedPages[id]; // 상태 JSON에서 삭제된 ID 찌꺼기 완벽 제거
    });

    saveSyncState({
      lastSyncTime: currentSyncTime.toISOString(),
      processedPages: nextProcessedPages,
    });

    console.log(
      `\n📊 완료: 새 ${newCount} / 업데이트 ${updatedCount} / 스킵 ${skippedCount} / 삭제 ${deletedIds.length}`,
    );
  } catch (e) {
    console.error("❌ 동기화 실패:", e);
    process.exit(1);
  }
}

// ========================================
// 글 처리 함수들
// ========================================

/**
 * 일반 페이지 처리 (개발/일상 + 그룹 없는 일반 글)
 * 경로: 카테고리/글슬러그.md
 */
async function processNormalPage(
  page,
  category,
  syncState,
  currentPageIds,
  postsMetadata,
  updatedPages,
  onCount,
  onSkip,
) {
  const cachedPage = syncState.processedPages[page.id];
  const isNew = !cachedPage;
  const isUpdated =
    cachedPage &&
    new Date(cachedPage.lastEdited) < new Date(page.last_edited_time);

  if (!isNew && !isUpdated) {
    onSkip();
    if (cachedPage) {
      const props = page.properties;
      postsMetadata.push({
        id: page.id,
        title: cachedPage.title ?? getPlainText(props.Title?.title),
        slug: cachedPage.slug,
        category,
        categorySlug: slugify(category),
        tags: cachedPage.tags ?? [],
        date: cachedPage.date ?? page.last_edited_time.split("T")[0],
        createdAt: cachedPage.createdAt ?? page.created_time,
        thumbnail: cachedPage.thumbnail,
        excerpt: cachedPage.excerpt ?? "",
        groupId: "",
        path: `${slugify(category)}/${cachedPage.slug}.md`,
        lastEdited: page.last_edited_time,
      });
    }
    return;
  }

  try {
    const postData = await processPost(page, category);
    postsMetadata.push(postData);
    updatedPages[page.id] = {
      slug: postData.slug,
      categorySlug: postData.categorySlug,
      title: postData.title,
      tags: postData.tags,
      date: postData.date,
      createdAt: postData.createdAt,
      thumbnail: postData.thumbnail,
      excerpt: postData.excerpt,
      lastEdited: page.last_edited_time,
    };
    onCount(isNew);
    console.log(
      `  ${isNew ? "🆕" : "🔄"} ${isNew ? "새 글" : "업데이트"}: ${postData.slug}`,
    );
  } catch (e) {
    console.error(`  ❌ 처리 실패 (ID: ${page.id}):`, e.message);
  }
}

/**
 * 그룹 내부 DB 글 처리
 * ✅ 경로: 카테고리/그룹슬러그/글슬러그.md
 */
async function processGroupPost(page, category, groupId, groupSlug) {
  const props = page.properties;
  const id = page.id;
  const title = getPlainText(props.Title?.title) || "Untitled";
  const slug = getPlainText(props.Slug?.rich_text) || slugify(title);
  const tags = props.Tags?.multi_select?.map((t) => t.name) || [];

  const date = props.Date?.date?.start || page.created_time.split("T")[0];
  const createdAt = page.created_time;

  const categorySlug = slugify(category);
  const content = await getPageContent(id);
  const excerpt = extractExcerptFromContent(content);
  const thumbnail =
    extractCoverImageFromProps(props, id) ||
    extractFirstImageFromContent(content);

  const groupDir = path.join(OUTPUT_DIR, categorySlug, groupSlug);
  if (!fs.existsSync(groupDir)) fs.mkdirSync(groupDir, { recursive: true });

  const frontMatter = `---
id: "${id}"
title: "${escapeYaml(title)}"
slug: "${slug}"
category: "${category}"
tags: ${JSON.stringify(tags)}
date: "${date}"
createdAt: "${createdAt}"
excerpt: "${escapeYaml(excerpt)}"
thumbnail: "${thumbnail}"
groupId: "${groupId}"
groupSlug: "${groupSlug}"
lastEdited: "${page.last_edited_time}"
---

${content}`;

  fs.writeFileSync(path.join(groupDir, `${slug}.md`), frontMatter, "utf-8");

  return {
    id,
    title,
    slug,
    category,
    categorySlug,
    groupSlug,
    tags,
    date,
    createdAt,
    excerpt,
    thumbnail,
    groupId,
    path: `${categorySlug}/${groupSlug}/${slug}.md`,
    lastEdited: page.last_edited_time,
  };
}

/**
 * 일반 글 처리
 * 경로: 카테고리/글슬러그.md
 */
async function processPost(page, category) {
  const props = page.properties;
  const id = page.id;
  const title = getPlainText(props.Title?.title) || "Untitled";
  const slug = getPlainText(props.Slug?.rich_text) || slugify(title);
  const tags = props.Tags?.multi_select?.map((t) => t.name) || [];

  // ✅ date: 표시용 (Date 속성 우선, 없으면 created_time 날짜)
  const date = props.Date?.date?.start || page.created_time.split("T")[0];

  // ✅ createdAt: 정렬용 (노션 페이지 생성 시각 전체)
  const createdAt = page.created_time; // "2026-02-28T10:30:00.000Z"

  const categorySlug = slugify(category);
  const content = await getPageContent(id);
  const rawExcerpt = getPlainText(props.Excerpt?.rich_text);
  const excerpt = rawExcerpt || extractExcerptFromContent(content);
  const thumbnail =
    extractCoverImageFromProps(props, id) ||
    extractFirstImageFromContent(content);

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
createdAt: "${createdAt}"
excerpt: "${escapeYaml(excerpt)}"
thumbnail: "${thumbnail}"
groupId: ""
lastEdited: "${page.last_edited_time}"
---

${content}`;

  fs.writeFileSync(path.join(categoryDir, `${slug}.md`), frontMatter, "utf-8");

  return {
    id,
    title,
    slug,
    category,
    categorySlug,
    tags,
    date,
    createdAt,
    excerpt,
    thumbnail,
    groupId: "",
    path: `${categorySlug}/${slug}.md`,
    lastEdited: page.last_edited_time,
  };
}

async function generateSitemap(posts) {
  const staticUrls = [
    { loc: `${BLOG_URL}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${BLOG_URL}/posts/개발`, priority: "0.8", changefreq: "weekly" },
    { loc: `${BLOG_URL}/posts/일상`, priority: "0.8", changefreq: "weekly" },
    { loc: `${BLOG_URL}/posts/책`, priority: "0.8", changefreq: "weekly" },
    {
      loc: `${BLOG_URL}/posts/프로젝트`,
      priority: "0.8",
      changefreq: "weekly",
    },
    { loc: `${BLOG_URL}/guestbook`, priority: "0.5", changefreq: "monthly" },
  ];

  const postUrls = posts.map((post) => ({
    loc: `${BLOG_URL}/post/${post.id}`,
    lastmod: post.lastEdited?.split("T")[0] ?? post.date,
    priority: "0.7",
    changefreq: "monthly",
  }));

  const allUrls = [...staticUrls, ...postUrls];

  const urlEntries = allUrls
    .map((u) => {
      const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
      const changefreq = u.changefreq
        ? `\n    <changefreq>${u.changefreq}</changefreq>`
        : "";
      const priority = u.priority
        ? `\n    <priority>${u.priority}</priority>`
        : "";
      return `  <url>\n    <loc>${u.loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
${urlEntries}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, xml, "utf-8");
  console.log(
    `\n🗺️  sitemap.xml 갱신 완료 (정적 ${staticUrls.length}개 + 포스트 ${posts.length}개)`,
  );
}

syncNotionPosts();
