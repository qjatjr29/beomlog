> **노션에서 글을 쓰면 자동으로 발행되는 나만의 개인 블로그**

## 💡 프로젝트 개요

이전에는 개발 또는 일상에 대한 글을 티스토리에 작성을 해왔습니다.

문서 작업은 노션이 너무 익숙해서 노션에 주로 작성을 하고 이를 티스토리에 옮기는 식으로 진행을 했었는데요…

이 과정이 너무 불편했습니다.

- 노션 → 티스토리 복사 시 서식이 깨지거나 이미지가 깨지는 문제
- 매번 수동으로 옮겨야 하는 번거로움
- 티스토리 에디터와 노션 에디터의 호환성 문제

그래서 **직접 나에게 맞는 블로그를 만들어보자!** 는 생각으로 시작하게 되었습니다!

## 🍄 미니홈피 컨셉

나만의 블로그를 만들면서 제가 예전에 했었던 `싸이월드` 가 생각이 났고 이런 컨셉으로 만들어보면 재밌겠다!! 싶어서 미니홈피 느낌으로 미니룸도 추가하고 미니미들도 추가해 볼 수 있도록 컨셉을 잡아서 진행했습니다.

- 🏠 **미니룸** — 배경 테마, 스티커, 미니미 등으로 꾸밀 수 있는 공간
- 🎵 **BGM 플레이어** — 유튜브 기반 배경음악 재생
- 📋 **방명록** — 방문자가 한마디 남길 수 있는 공간
- 👥 **일촌 목록** — 지인 블로그 링크 모음
- 📊 **방문자 통계** — 오늘/누적 방문자 수 표시

<img width="542" height="558" alt="Image" src="https://github.com/user-attachments/assets/9dd797f4-9a2a-4d0a-8101-a92c508fa5f8" />

## **🤖 사용 기술**

### **Frontend**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### **DB & Infra**

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)

### **API**

![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![YouTube](https://img.shields.io/badge/YouTube_API-FF0000?style=for-the-badge&logo=youtube&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### ↗️ 전체적인 흐름

![image.png](attachment:138a7b7f-77d5-4f91-9281-8bdb143ff89d:image.png)

## 📂 폴더 구조

```bash
├── public
├── scripts
│   └── notion-sync.js         # 노션 동기화 스크립트
├── src
│   ├── App.tsx
│   ├── Root.tsx
│   ├── assets
│   │   └── posts
│   │       ├── groups.json     # 전체 그룹 메타데이터
│   │       ├── posts.json      # 전체 포스트 메타데이터
│   │       └── {category}/     # 카테고리별 .md 파일
│   ├── contexts                # 전역 상태 관리
│   ├── data
│   │   └── storage             # Supabase 연동
│   ├── features
│   │   ├── about/              # about
│   │   ├── bgm/                # BGM 플레이어
│   │   ├── comment/            # 댓글
│   │   ├── guestbook/          # 방명록
│   │   ├── home/               # 홈
│   │   ├── layout/             # 메인 레이아웃
│   │   ├── markdown/           # 마크다운 렌더러
│   │   ├── mini-room/          # 미니룸
│   │   ├── not-found/
│   │   └── posts/              # 포스트 목록 & 상세
│   ├── lib
│   │   └── supabase.ts
│   ├── main.tsx
│   ├── routes.ts
│   ├── shared/
│   └── styles/
```

## 🚀 구현 문서

> 각 기능의 상세 구현 내용은 `Wiki` 에서 확인할 수 있습니다.

| 문서            | 설명                                  |
| --------------- | ------------------------------------- |
| Notion CMS 연동 | 노션 API로 글 동기화하는 방법         |
| 마크다운 렌더러 | 커스텀 마크다운 파서 구현             |
| n8n 자동화      | 노션 문서 동기화 자동 워크플로우 구성 |
| Supabase 설계   | DB 스키마 및 RLS 보안 설계            |
| BGM 플레이어    | YouTube Iframe API 연동               |
| 미니룸          | 싸이월드 감성 미니룸 구현             |
