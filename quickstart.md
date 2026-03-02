# 🚀 빠른 시작 가이드

## 1️⃣ 로컬 개발 (5분 안에!)

### 필수 조건

- Node.js 18 이상
- Git

### 단계별 실행

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/cyworld-blog.git
cd cyworld-blog

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행 (Supabase 없이도 가능!)
npm run dev
```

브라우저에서 `http://localhost:3000` 접속! 🎉

> **참고**: Supabase 없이도 로컬 스토리지로 동작하므로 바로 테스트 가능합니다.

---

## 2️⃣ Supabase 연동 (댓글/방명록)

### A. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: cyworld-blog)
4. Database 비밀번호 설정
5. Region 선택 (Northeast Asia - Seoul 권장)

### B. 데이터베이스 설정

1. Supabase Dashboard → SQL Editor
2. `supabase-setup.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. "Run" 클릭

✅ 테이블 4개 생성 완료!

- `comments` (댓글)
- `guestbook` (방명록)
- `settings` (관리자 설정)
- `visitor_stats` (방문자 통계)

### C. 환경변수 설정

1. Supabase Dashboard → Settings → API
2. 다음 정보 복사:
   - `Project URL`
   - `anon/public` key

3. 프로젝트 루트에 `.env` 파일 생성:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. 개발 서버 재시작:

```bash
npm run dev
```

🎉 댓글과 방명록이 Supabase에 저장됩니다!

---

## 3️⃣ Notion 연동 (블로그 포스트)

### A. Notion Integration 생성

1. [Notion Integrations](https://www.notion.so/my-integrations) 접속
2. "+ New integration" 클릭
3. 이름 입력: "Cyworld Blog"
4. Capabilities: "Read content" 선택
5. "Submit" → **Integration Token 복사 (중요!)**

### B. Notion 데이터베이스 생성

1. Notion에서 새 페이지 생성
2. `/database` 입력 → "Table - Inline" 선택
3. 다음 속성(Properties) 추가:

| 속성 이름 | 타입         | 설명                         |
| --------- | ------------ | ---------------------------- |
| Title     | Title        | 포스트 제목                  |
| Slug      | Text         | URL 경로 (예: my-first-post) |
| Category  | Select       | 카테고리 (Dev Log, Daily 등) |
| Tags      | Multi-select | 태그들                       |
| Published | Checkbox     | 공개 여부 (체크해야 동기화)  |
| Date      | Date         | 작성일                       |
| Excerpt   | Text         | 짧은 설명 (선택)             |

4. 데이터베이스 우측 상단 `⋯` → "Add connections"
5. 생성한 Integration 선택

### C. Database ID 확인

데이터베이스 페이지 URL 확인:

```
https://www.notion.so/myworkspace/abc123def456?v=...
                                 ^^^^^^^^^^^^
                              이 부분이 Database ID
```

### D. 테스트 포스트 작성

1. 데이터베이스에 새 행 추가
2. 모든 속성 입력
3. **Published 체크박스 반드시 체크!**
4. 페이지 내용 작성

### E. 로컬에서 동기화 테스트

```bash
# 환경변수 설정 (임시)
export NOTION_TOKEN=your-integration-token
export NOTION_DATABASE_ID=your-database-id

# 동기화 실행
npm run sync
```

✅ `public/posts/` 폴더에 Markdown 파일 생성 확인!

---

## 4️⃣ GitHub에 배포

### A. GitHub Repository 생성

1. GitHub에서 새 Repository 생성
2. Repository 이름: `cyworld-blog` (또는 원하는 이름)
3. Public/Private 선택

### B. GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions → "New repository secret"

다음 4개 secret 추가:

| Name                     | Value                    |
| ------------------------ | ------------------------ |
| `VITE_SUPABASE_URL`      | Supabase Project URL     |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key        |
| `NOTION_TOKEN`           | Notion Integration Token |
| `NOTION_DATABASE_ID`     | Notion Database ID       |

### C. 코드 푸시

```bash
# Git 초기화 (처음 한 번만)
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Remote 추가
git remote add origin https://github.com/yourusername/cyworld-blog.git

# 푸시!
git push -u origin main
```

### D. GitHub Pages 활성화

1. Repository → Settings → Pages
2. Source: **"GitHub Actions"** 선택
3. 저장

### E. 배포 확인

1. Repository → Actions 탭
2. "Deploy to GitHub Pages" 워크플로우 확인
3. 완료되면 `https://yourusername.github.io/cyworld-blog` 접속!

---

## 5️⃣ 자동 동기화 확인

### Notion 포스트 자동 동기화

- **주기**: 매 시간마다 (GitHub Actions)
- **확인**: Repository → Actions → "Sync Notion to GitHub"

### 수동 동기화

필요시 GitHub Actions에서 "Run workflow" 클릭!

---

## 📋 체크리스트

### 로컬 개발

- [ ] Node.js 18 이상 설치
- [ ] `npm install` 실행
- [ ] `npm run dev` 실행
- [ ] `localhost:3000` 접속 확인

### Supabase

- [ ] Supabase 프로젝트 생성
- [ ] `supabase-setup.sql` 실행
- [ ] `.env` 파일 생성
- [ ] 댓글/방명록 테스트

### Notion

- [ ] Integration 생성 및 Token 복사
- [ ] 데이터베이스 생성 및 속성 추가
- [ ] Connection 연결
- [ ] Database ID 확인
- [ ] 테스트 포스트 작성
- [ ] 로컬 동기화 테스트

### GitHub

- [ ] Repository 생성
- [ ] Secrets 4개 등록
- [ ] 코드 푸시
- [ ] GitHub Pages 활성화
- [ ] 배포 확인

---

## 🆘 문제 해결

### Q. 개발 서버가 실행되지 않아요!

```bash
# 포트가 이미 사용중일 수 있습니다
# package.json에서 포트 변경하거나
killall node  # 기존 Node 프로세스 종료
```

### Q. Supabase 연결이 안 돼요!

- `.env` 파일이 프로젝트 루트에 있는지 확인
- URL과 Key에 따옴표나 공백이 없는지 확인
- 개발 서버를 재시작했는지 확인

### Q. Notion 동기화가 안 돼요!

- Integration이 데이터베이스에 연결되어 있는지 확인
- `Published` 체크박스가 체크되어 있는지 확인
- Database ID가 정확한지 확인

### Q. GitHub Actions가 실패해요!

- Secrets이 모두 등록되어 있는지 확인
- Secret 이름이 정확한지 확인 (대소문자 구분!)

### Q. 배포 후 페이지가 안 열려요!

- GitHub Pages 설정에서 Source가 "GitHub Actions"인지 확인
- Actions 탭에서 배포가 성공했는지 확인
- URL이 정확한지 확인

---

## 📚 다음 단계

- [상세 설정 가이드](./PROJECT_SETUP_GUIDE.md) - 고급 설정
- [README](./README.md) - 프로젝트 개요
- 컴포넌트 커스터마이징
- 테마 색상 변경
- 프로필 정보 수정

---

✨ **Happy Blogging!**

문제가 있으면 GitHub Issues에 등록해주세요!
