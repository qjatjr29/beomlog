---
id: "318d67b9-9e80-80ab-8578-ca7480e0d732"
title: "n8n을 이용한 자동화 워크플로우"
slug: "n8n을-이용한-자동화-워크플로우"
category: "프로젝트"
tags: ["n8n"]
date: "2026-03-03"
createdAt: "2026-03-03T02:02:00.000Z"
excerpt: "정적 사이트의 특성상 노션 동기화 후 반드시 재빌드 및 재배포가 필요해요. 새로운 블로그 글이 생기거나 업데이트, 삭제가 발생했을 수 있기 때문 이렇게 제 프로젝트 구조에서는 노션..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fbd64f6d2-a3f5-4111-be51-a5470e4cb7c8%2Fimage.png?table=block&id=318d67b9-9e80-80d5-90b4-de4cf8e0f584&cache=v2"
groupId: "318d67b9-9e80-8094-b1b0-fbfe2cef285d"
groupSlug: "beomlog"
lastEdited: "2026-03-04T04:42:00.000Z"
---


**정적 사이트의 특성상** 노션 동기화 후 반드시 재빌드 및 재배포가 필요해요.
- 새로운 블로그 글이 생기거나 업데이트, 삭제가 발생했을 수 있기 때문

이렇게 제 프로젝트 구조에서는 노션에 작성한 글에 대해서 반영을 해주기 위해서는 아래처럼 동작해줘야 해요.
> **새로운 글을 새로 생성하는 예**
> 1. 노션에 글을 작성 (블로그에 올릴 각 카테고리별 데이터베이스에 새로운 page을 만들어 작성)
> 2. Published 속성 체크 (체크박스 속성)
> 3. 수동으로 스크립트 실행 
> 4. 파일이 생성된 것을 확인 한 후 커밋
> 5. 직접 main 브랜치에 push 


이렇게 수동으로 하는 작업을 줄이기 위해 <span class="text-blue">**n8n**</span>을 이용해서 자동으로 노션글을 가져와 md 파일을 생성/업데이트/삭제하고 메타데이터 정보를 수정하여 블로그에 반영되도록 하는 워크플로우를 만들어봤어요.

## 🤔 왜 n8n인가?
저는 동기화 스크립트(`sync-notion.js`)를 자동으로 실행할 방법이 필요했어요.


| 방법 | 장점 | 단점 |
| ---- | ---- | ---- |
| GitHub Actions (Cron) | 익숙하고 무료 | 저장소에 Notion 토큰 노출 위험, 실행 환경 제한 |
| **n8n (셀프호스팅)** | 완전한 제어, 커스텀 코드 실행 가능 | 서버 필요 |

### ✅ **n8n을 선택한 이유**
`인프라의 결합도 분리`
- **n8n - **콘텐츠 관리 라는 별도의 레이어로 분리했어요.
- n8n 서버에서 독립적으로 동기화 로직을 처리함으로써 **GitHub는 순수하게 소스 코드와 최종 데이터만 저장하는 역할**에 집중하도록 했어요.

`실행 확인`
- 복잡한 YAML 로그를 뒤지는 대신 n8n의 GUI를 통해 워크플로우의 실행 상태를 한눈에 파악할 수 있다고 생각했어요. 어떤 단계에서 지연이 생기는지 데이터가 어떻게 흘러가는지 시각적으로 모니터링이 가능!

`새로운 기술 스택`  ⭐
- 가장 솔직한 이유는 **새로운 자동화 도구**에 대한 사용이였어요. 
- n8n이라는 기술을 실제로 사용해 자동화 워크플로우를 구축해보고자 했어요.

## 🐳 n8n 도커 세팅
### 🐙 Docker-compose.yml
```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n-blog-automation
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - GENERIC_TIMEZONE=Asia/Seoul
      - TZ=Asia/Seoul
      - NODES_EXCLUDE=[]
    volumes:
      # n8n 자체 설정 데이터 저장소 (워크플로우 데이터 보존용)
      - n8n_data:/home/node/.n8n
     
      # 실제 프로젝트 경로
      - Users/user/Desktop/project/blog:/app/blog

volumes:
  n8n_data:
```



## 🔑 Github 인증 처리
> n8n이 코드를 실행하고 Github에 `push`까지 하려면 **Git 권한**이 필요


아까 말했듯이 Docker 컨테이너 안은 완전 새로운 컴퓨터라서, 네 맥북에 설정된 Git 로그인 정보(SSH 키 등)를 모르는 상태야. 게다가 우리가 터미널을 직접 치는 게 아니라 n8n이 자동으로 명령어를 실행해야 하니까, 비밀번호를 물어보는 창이 뜨면 안 되겠지?
그래서 **Github Personal Access Token (PAT)** 이라는 비밀번호 대용 토큰이 필요해.
(네 로컬 맥북의 Git 설정을 건드리지 않고, n8n에서만 안전하게 쓰기 위한 가장 깔끔한 방법이야.)

> 📖 <span class="text-blue">**`Github Personal Access Token`**</span><span class="text-blue">** **</span>**이란**
> - **Git 명령어나 API를 통해 GitHub 리소스에 접근할 때아이디와 비밀번호(계정 비밀번호) 대신 사용하는 보안 인증 토큰**


### 🔑 Github 토큰(PAT) 발급 방법
1. Github에 로그인하고 우측 상단 프로필 클릭 -> **Settings**
2. 왼쪽 메뉴 맨 아래 **Developer settings** 클릭
3. **Personal access tokens** -> **Tokens (classic)** 클릭
4. **Generate new token (classic)** 버튼 클릭
5. Expiration(만료일) 설정
6. **Select scopes**에서 **`repo`** (Full control of private repositories) 체크
7. 맨 아래 **Generate token** 클릭

> 🚨 **주의**
> -  `ghp_` 로 시작하는 긴 토큰이 화면에 나타나면** 복사해두기!**


## 전체 흐름
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fbd64f6d2-a3f5-4111-be51-a5470e4cb7c8%2Fimage.png?table=block&id=318d67b9-9e80-80d5-90b4-de4cf8e0f584&cache=v2" alt="image" width="1108" height="816" loading="lazy" />

## 🏃 n8n 워크플로우 구성
워크플로우는 총 2개 노드로 구성돼 있습니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F09bb83b4-12fa-404a-be5c-e9f1aa718156%2Fimage.png?table=block&id=318d67b9-9e80-80aa-b1a4-e0feaa53af3c&cache=v2" alt="image" width="1012" height="390" loading="lazy" />


### 1️⃣ Schedule Trigger (스케줄러)
10분마다 워크플로우를 자동 실행합니다

### 2️⃣ Execute Command (스크립트 실행)
서버에서 직접 `sync-notion.js`를 실행해요.
- Schedule Trigger 노드와 연결

```bash
cd /app/blog
git config --global user.name "n8n-auto-bot"
git config --global user.email "n8n-bot@example.com"

node ./scripts/notion-sync.js

git add src/assets public/sitemap.xml .notion-sync-state.json
git commit -m "feat: 노션 블로그 동기화 (by n8n) 🚀 " || echo "No changes to commit"
git push https://qjatjr29:ghp_roXu@github.com/qjatjr29/beomlog.git main
```

- 동기화 스크립트가 파일을 변경했다면 Git에 커밋하고 푸시를 합니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Ff78dcd9e-6c1a-42c3-a582-d722ca2eecfa%2Fimage.png?table=block&id=318d67b9-9e80-8054-8f5f-ef6665457a2f&cache=v2" alt="image" width="844" height="218" loading="lazy" />


## ✅ 트리거 방식 결정 과정
처음부터 스케줄러를 선택한 건 아니었어요.
### 1️⃣ Notion Webhook
노션의 `Published` 속성이 변경되는 순간 바로 트리거를 받는 방식이에요.
가장 이상적이지만 두 가지 문제가 있었어요.
- 노션 Webhook은 **유료 요금제**에서만 사용 가능
- n8n을 로컬(Docker)에서 실행 중이라 외부에서 접근 가능한 공개 URL이 없음
→ 추후 n8n을 클라우드로 이전하면 적용 가능!!

### 2️⃣ n8n Notion Trigger
n8n에 내장된 Notion Trigger 노드를 사용하는 방식 또한 고민한 내용중 하나에요.
하지만 아래와 같은 문제가 있었어요.

1. **DB당 트리거 1개**
  노드 1개당 하나의 데이터베이스 ID만 감시할 수 있어요.
  `개발 / 일상 / 책 / 프로젝트` 4개 DB를 감시하려면 `Added + Updated` 이벤트로 트리거만 8개가 필요했어요.
  - 새로운 DB들이 추가될 수록 트리거가 많아지고 관리가 어려워질 것이다..!
1. **중첩 DB(자식 DB) 감지 불가**
  책과 프로젝트는 그룹 페이지 안에 `child_database`가 있는 구조예요.
  노션 API 특성상 자식 DB에 글을 써도 부모 DB에 Updated 이벤트가 발생하지 않아요.
  이처럼 자식 DB는 별도의 고유한 DB ID를 가지기 때문에 n8n은 그 안에 변경이 있는지 알 수가 없었어요.

### 3️⃣ Schedule Trigger (Cron) ✅
결국 10분마다 무조건 스크립트를 실행하는 방식을 선택했어요.
비효율적이지만..! `sync-notion.js`가 **멱등성**을 보장하도록 동작하기 때문에 괜찮을 것이라 생각했어요.
- 변경이 없으면 → 바로 종료
- 변경이 있을 때만 → 파일 생성/수정/삭제 → Git 커밋 + 푸시

## ⚠️ 트러블슈팅 - Vercel 배포 차단 문제
워크플로우를 처음 설정했을 때 Vercel에서 아래와 같은 메일을 받았어요.
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fa9a9717f-ac75-42a9-897e-698c95d54fc1%2Fimage.png?table=block&id=318d67b9-9e80-8090-a54c-f0c9e0f987d3&cache=v2" alt="image" width="1004" height="348" loading="lazy" />


Vercel은 커밋한 사람의 이메일 주소로 권한을 확인해요.
`n8n-bot@example.com`처럼 Vercel에 등록되지 않은 이메일로 커밋하면 "처음 보는 사람이 배포하려 한다"고 판단해서 배포를 차단하고 확인 메일을 보내요.

💡 이메일을 **본인의 실제 GitHub 이메일**로 설정
```bash
git config --global user.name "n8n-auto-bot"
git config --global user.email "본인_깃헙_이메일@gmail.com"
```


## 📚 Ref.
<span class="inline-link" data-url="https://docs.n8n.io/hosting/installation/docker/#updating" data-domain="docs.n8n.io"></span>
<span class="inline-link" data-url="https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/#operations" data-domain="docs.n8n.io"></span>
<span class="inline-link" data-url="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/" data-domain="docs.n8n.io"></span>
<span class="inline-link" data-url="https://developers.notion.com/reference/webhooks" data-domain="developers.notion.com"></span>
