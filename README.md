# 🌐 싸이월드 감성 개인 블로그

Notion에서 글을 작성하면 GitHub Actions로 자동 동기화되어 GitHub Pages에 배포되는 개인 블로그입니다.  
싸이월드 특유의 미니홈피 감성을 블루 톤으로 재해석했습니다.

## ✨ 주요 기능

- 📝 **Notion 기반 블로그**: Notion에서 글 작성, GitHub Actions로 1시간마다 자동 동기화
- 🎨 **싸이월드 감성 UI**: 미니홈피 레이아웃, 방문자 카운터, BGM 재생
- 💬 **익명 댓글 시스템**: Supabase 기반, 닉네임+비밀번호로 작성
- 📖 **방명록**: 추억의 방명록 기능
- 🏠 **미니룸 꾸미기**: 드래그 앤 드롭으로 나만의 미니룸 꾸미기
- 🎭 **5가지 테마**: 다양한 색상 테마 선택
- 📱 **반응형 디자인**: 모바일/데스크톱 모두 지원

## 🛠️ 기술 스택

### Frontend

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 환경
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **React Router** - 라우팅
- **React Markdown** - 마크다운 렌더링

### Backend & Infrastructure

- **Supabase** - 댓글/방명록 데이터베이스
- **Notion API** - 블로그 포스트 관리
- **GitHub Actions** - CI/CD 자동화
- **GitHub Pages** - 정적 사이트 호스팅

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/yourusername/cyworld-blog.git
cd cyworld-blog
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 편집:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📦 배포

### GitHub Pages 배포

1. **GitHub Repository 생성**
2. **GitHub Secrets 설정** (Settings → Secrets and variables → Actions)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
3. **코드 푸시**
   ```bash
   git push origin main
   ```
4. **GitHub Actions 자동 배포** 확인
5. **GitHub Pages 활성화** (Settings → Pages → Source: GitHub Actions)

## 📚 상세 설정 가이드

**전체 설정 가이드는 [PROJECT_SETUP_GUIDE.md](./PROJECT_SETUP_GUIDE.md)를 참고하세요.**

주요 내용:

- Vite + React + Tailwind 프로젝트 구조
- Supabase 데이터베이스 설정
- Notion API 연동
- GitHub Actions 워크플로우
- 실시간 댓글 구독

## 📁 프로젝트 구조

```
cyworld-blog/
├── .github/
│   └── workflows/          # GitHub Actions 워크플로우
├── components/             # React 컴포넌트
│   ├── ui/                # 기본 UI 컴포넌트
│   ├── About.tsx          # 프로필 페이지
│   ├── PostList.tsx       # 포스트 목록
│   ├── PostDetail.tsx     # 포스트 상세
│   ├── Guestbook.tsx      # 방명록
│   └── ...
├── lib/                   # 라이브러리 설정
│   └── supabase.ts        # Supabase 클라이언트
├── types/                 # TypeScript 타입
├── utils/                 # 유틸리티 함수
├── styles/                # 스타일
├── public/                # 정적 파일
│   └── posts/            # Notion 동기화된 MD 파일
├── scripts/              # 스크립트
│   └── notion-sync.js    # Notion 동기화
└── ...
```

## 🎯 사용 방법

### Notion에서 글 작성

1. Notion 데이터베이스 생성
2. 속성 추가: Title, Slug, Category, Tags, Published, Date
3. Integration 연결
4. 글 작성 후 `Published` 체크
5. 1시간 이내 자동 동기화!

### 댓글 및 방명록

- **댓글 작성**: 닉네임 + 비밀번호 입력
- **삭제**: 작성시 입력한 비밀번호로 삭제 가능
- **실시간 업데이트**: Supabase Realtime으로 즉시 반영

### 미니룸 꾸미기

1. 홈 화면에서 "🎨 미니룸 꾸미기" 클릭
2. 관리자 비밀번호 입력 (기본: `admin123`)
3. 스티커 추가 및 드래그로 위치 조정
4. 저장 버튼 클릭

## 🔧 커스터마이징

### 색상 테마 변경

`tailwind.config.js`에서 색상 수정:

```javascript
colors: {
  'cyworld-blue': '#5b8ec4',
  'cyworld-blue-light': '#7c9cc4',
  // ...
}
```

### 프로필 정보 수정

`components/About.tsx` 파일 편집

### BGM 변경

`components/BGMPlayer.tsx`에서 YouTube 비디오 ID 수정

## 🎓 참고 자료

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Vite Project Structure](https://vitejs.dev/guide/)
- [React Folder Structure](https://react.dev/learn/thinking-in-react)

---

## 📞 문의

- GitHub: [@qjatjr29](https://github.com/qjatjr29)
- Email: hhqjatjr@gmail.com


