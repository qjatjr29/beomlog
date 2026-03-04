---
id: "318d67b9-9e80-800c-b76c-c5c9ab83a319"
title: "Notion을 Content Source로 이용하기"
slug: "notion을-content-source로-이용하기"
category: "프로젝트"
tags: ["Notion"]
date: "2026-03-03"
createdAt: "2026-03-03T02:01:00.000Z"
excerpt: "이번에 개인 블로그를 만들면서 노션을 Content Source로 사용하고 이를 API를 통해서 가져와 사용하는 방법을 정리해보고자 해요. 🎯 왜 노션을 이용?!? 기존에는 노션..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F48d646c7-ccc5-4596-8ac8-48719f8a51ea%2Fimage.png?table=block&id=318d67b9-9e80-80f4-9843-ddb5ed2af20b&cache=v2"
groupId: "318d67b9-9e80-8094-b1b0-fbfe2cef285d"
groupSlug: "beomlog"
lastEdited: "2026-03-04T04:30:00.000Z"
---


이번에 개인 블로그를 만들면서 노션을 <span class="text-blue">**`Content Source`**</span>로 사용하고 이를 API를 통해서 가져와 사용하는 방법을 정리해보고자 해요.
## 🎯 왜 노션을 이용?!?
기존에는 노션에서 글을 작성한 뒤 티스토리에 수동으로 작성한 글들을 옮겨서 블로그에 올렸었어요.
이 과정에서 반복적으로 아래 문제들이 발생했어요.
- 복사/붙여넣기 시 서식과 이미지가 깨지는 문제
- 매번 수동으로 옮겨야 하는 번거로움
- 티스토리 에디터에 종속되어 커스텀 불가

저는 노션을 모든 문서 작업하는데 사용하고 있어 노션을 CMS 처럼 활용하고 위와 같은 수동 과정을 없애고 **노션에서 작성 → 자동으로 블로그에 반영**되는 구조를 만들어보고자 했어요.

| 기존 방식 | 개선 방식 |
| ---- | ---- |
| 노션 작성 → 티스토리 수동 복붙 | 노션 작성 → 자동 동기화 |
| 복붙 시 서식/이미지 깨짐 | 마크다운 변환으로 일관된 렌더링 |
| 플랫폼에 종속 | 직접 만든 블로그 - 완전한 커스텀 가능 |

## ⚙️ 노션 API 설정
### 🔍 Notion Integration이란?
Notion Integration은 Notion API를 통해 페이지, 데이터베이스에 프로그래밍적으로 접근할 수 있게 해주는 연결 설정입니다.
Integration을 만들면 API Secret(토큰)이 발급되고, 이 토큰으로 인증된 API 요청을 보낼 수 있습니다.
> 단, Integration이 접근하려는 페이지에 명시적으로 권한을 부여해야 합니다.


### Integration 생성
1. Notion Developers 접속
2. `New integration` 클릭
3. 이름 입력 + 연결할 워크스페이스 선택
4. `Configuration` 탭에서 **API Secret** 복사 후 안전하게 보관 🔑

### 노션 데이터베이스에 권한 부여
Integration을 만들었으면 접근할 노션 페이지(데이터베이스)에 Integration을 연결해주어야 해요.
1. 노션 데이터베이스 페이지 우측 상단 `...` 클릭
2. `Add connections` 선택
3. 만든 Integration 검색 후 선택
4. 해당 페이지와 하위 모든 페이지에 접근 권한 부여 확인

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F48d646c7-ccc5-4596-8ac8-48719f8a51ea%2Fimage.png?table=block&id=318d67b9-9e80-80f4-9843-ddb5ed2af20b&cache=v2" alt="image" width="2378" height="960" loading="lazy" />


### 데이터베이스 ID 확인
```javascript
https://www.notion.so/12345678901234567890?v=...
```

`12345678901234567890` 이 부분이 <u>**Database ID**</u> !!

### 환경변수 설정
```bash
NOTION_TOKEN=secret_xxxx        # Integration API Secret
NOTION_DATABASE_ID=xxxx         # 블로그 데이터베이스 ID
```


## 🔄 동기화 스크립트
Notion API로 데이터를 가져와 `.md` 파일과 `.json` 파일로 변환하는 `js` 스크립트를 만들어 노션 데이터베이스에 작성한 글을 바로 변환하도록 했어요.

```bash
Notion API 호출 (Published된 페이지만)
    ↓
sync-state.json과 비교 → 변경된 것만 처리
    ↓
노션 블록 → 마크다운 변환
    ↓
카테고리별 .md 파일 저장
    ↓
posts.json / groups.json 업데이트
    ↓
sync-state.json 갱신
```


### 동기화 방식
매번 모든 페이지를 다시 처리하면 비효율적이라 생각해  `.notion-sync-state.json`으로 변경된 글만 처리하고자 했어요.
```json
{
  "lastSyncTime": "2025-01-01T00:00:00.000Z",
  "processedPages": {
    "{pageId}": {
      "slug": "my-post",
      "categorySlug": "dev",
      "lastEdited": "2025-01-01T00:00:00.000Z"
    }
  }
}
```


### 노션 블록 → 마크다운 변환
> 노션의 각 블록 타입을 마크다운 문법으로 변환하도록 코드를 작성했어요.


**지원 블록 타입 목록**

| 노션 블록 | 변환 결과 |
| ---- | ---- |
| Paragraph | 일반 텍스트 |
| Heading 1/2/3 | `#` `##` `###` |
| Bulleted list | `- item` |
| Numbered list | `1. item` |
| Code | ````language ```` |
| Quote | `> text` |
| Callout | `> emoji text` (blockquote 형식) |
| Toggle | `<details><summary>` |
| Image | `<img>` (width/height 포함) |
| Table | 마크다운 테이블 |
| Bookmark | `<div class="bookmark">` |
| Divider | `---` |

### 삭제 처리
**`Published`****가 해제되거나 노션에서 페이지가 삭제되면** 다음 동기화 시 해당 `.md` 파일과 메타데이터도 함께 제거됩니다. 

### 그룹 포스트
`IsGroup` 속성이 체크된 페이지는 그룹으로 처리하고 해당 페이지의 **하위 페이지들**이 해당 그룹의 글이 됩니다.

**예시**
```bash
📁 시스템 디자인 스터디 (IsGroup ✅)
  ├── 📄 1. 사용자 수에 따른 규모 확장성
  └── 📄 2. 개략적인 규모 추정
```


## 🧸 이미지 처리
이미지 관련해서 두 가지 문제가 있었어요.
### ⚠️ 이미지 URL 만료
노션 이미지는 AWS S3에 저장되며 URL에 만료 기간이 포함되어 있었어요.
- Notion API를 통해 받은 이미지의 url은 **요청 1시간 뒤에 만료**되도록 설정되어 있어요.

이 URL을 그대로 마크다운 파일에 저장하게 되면 나중에 블로그에 올라간 글에서는 이미지가 깨진 것처럼 보일 수 있었어요.

💡 **해결 - Notion 이미지 프록시 URL로 변환**
웹에서 공유된 Notion 페이지의 HTML을 살펴보니 노션이 `/image/…` 경로를 통해 이미지를 프록시 서빙하는 것을 확인할 수 있습니다.
따라서 저도 이런 방식을 이용해 `/image/` 프록시 URL을 활용해 직접 S3 서명 URL을 쓰지 않고도 만료 문제를 우회하기로 했어요!!
노션은 `notion.so/image/` 경로를 통해 이미지를 프록시 서빙하고 있어요.

```bash
노션에서 가져온 원본 URL (일정 시간 만료)
> https://prod-files-secure.s3.us-west-2.amazonaws.com/...?X-Amz-Expires=3600&...

변환된 프록시 URL 
> https://www.notion.so/image/https%3A%2F%2Fprod-files-secure...?table=block&id=xxx&cache=v2
```


### ⚠️ 이미지 크기로 인한 레이아웃 깨짐 (CLS)
이미지를 일반 마크다운으로 저장하면 `width`와 `height` 정보가 없어 브라우저가 레이아웃을 미리 잡지 못하고 이미지가 로드될 때 주변 콘텐츠가 밀리는 **CLS(Cumulative Layout Shift)** 문제가 발생했어요.
또한 노션에서 아주 큰 이미지를 첨부하면 블로그 글 화면의 너무 많은 부분을 차지하는 문제도 발생했어요.

💡 **해결  이미지 메타데이터 사전 측정 및 최대 크기 제한**
`probe-image-size` 라이브러리로 동기화 시점에 이미지 크기를 미리 측정해 마크다운에 포함시키고 CSS로 최대 크기를 제한하는 방식으로 처리를 하고자 했어요.
```javascript
const metadata = await getImageMetadata(url); // width, height 측정

if (metadata) {
  // width, height를 명시 → 브라우저가 렌더링 전에 레이아웃 공간 확보
  markdown = `<img
    width="${metadata.width}"
    height="${metadata.height}"
    loading="lazy"
  />`;
}
```


## 🧑‍💻 프론트엔드에서 마크다운 파싱
### 1️⃣ 파일 불러오기  `import.meta.glob`
Vite의 `import.meta.glob`을 사용해 빌드 타임에 모든 `.md` 파일을 번들에 포함시키도록 했어요.

```typescript
const postFiles = import.meta.glob("/src/assets/posts/**/*.md", {
  query: "?raw",      // 파일을 문자열 그대로 가져옴
  import: "default",
  eager: true,        // 빌드 타임에 즉시 로드
}) as Record<string, string>;
```

> **`eager: true`** 옵션으로 런타임 API 호출 없이 빌드 타임에 모든 파일을 번들에 포함해요.


### Front Matter 파싱
**Front Matter**
- **마크다운(.md) 등 문서 최상단에 YAML, JSON, TOML 형식을 사용해 작성하는 메타데이터 구역**

마크다운 파일 상단의 `---` 블록에서 메타데이터를 추출합니다.
```typescript
const parsePostContent = (markdown: string) => {
  const FRONT_MATTER_REGEX = /^\s*---\s*\r?\n([\s\S]*?)\r?\n\s*---\s*\r?\n?([\s\S]*)$/;
  const match = markdown.match(FRONT_MATTER_REGEX);

  const [_, frontMatterRaw, content] = match;

  // 각 줄을 파싱해서 key: value 추출
  frontMatterRaw.split(/\r?\n/).forEach((line) => {
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    metadata[key] = cleanValue(value); // 따옴표 제거 등 정제
  });

  return { frontMatter: metadata, content: content.trim() };
};
```

### 마크다운 렌더링
파싱된 `content`는 커스텀 마크다운 렌더러(`MarkdownRenderer`)를 통해 React 컴포넌트로 변환됩니다.
마크다운 렌더러의 상세 구현은 **마크다운 렌더러 문서** 를 참고해주세요!

**정적 사이트의 특성상** 노션 동기화 후 반드시 재빌드 및 재배포가 필요해요.
따라서 n8n 워크플로우에서 동기화 완료 후 자동으로 빌드를 트리거하고자 해요. 
- **n8n 자동화 문서** 참고
## 📚 Ref.
<span class="inline-link" data-url="https://developers.notion.com/guides/get-started/getting-started" data-domain="developers.notion.com"></span>
<span class="inline-link" data-url="https://developers.notion.com/reference/intro" data-domain="developers.notion.com"></span>
<span class="inline-link" data-url="http://notion.so/my-integrations" data-domain="notion.so"></span>

