---
id: "318d67b9-9e80-80b2-b494-ddf6f1a51244"
title: "Supabase 설계 및 연동"
slug: "supabase-설계-및-연동"
category: "프로젝트"
tags: ["Supabase","PostgreSQL"]
date: "2026-03-03"
createdAt: "2026-03-03T04:31:00.000Z"
excerpt: "블로그의 동적 데이터(댓글, 방문자 통계, 조회수, 미니룸, BGM 등)등을 처리하기 위해서 DB가 필요하다고 생각했고 이렇게 실시간으로 변하는 데이터를 Supabase를 이용해서..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F027e4a4b-689e-45ce-86cc-5535d7747225%2Fimage.png?table=block&id=319d67b9-9e80-8094-94e4-f34e4a9e841f&cache=v2"
groupId: "318d67b9-9e80-8094-b1b0-fbfe2cef285d"
groupSlug: "beomlog"
lastEdited: "2026-03-04T04:30:00.000Z"
---

블로그의 동적 데이터(댓글, 방문자 통계, 조회수, 미니룸, BGM 등)등을 처리하기 위해서 DB가 필요하다고 생각했고 이렇게 실시간으로 변하는 데이터를 Supabase를 이용해서 처리하고자 했어요.
## 🧑‍💻 왜 Supabase인가?
저의 블로그는 정적 사이트(React + Vite) 기반이지만 다음과 같은 **실시간으로 변하는 데이터**를 다루고 있어요.
- 댓글
- 방문자 통계
- 조회수
- 미니룸 설정
- BGM
- 상태 메시지
정적 배포(Vercel) 환경에서는 이런 데이터를 저장하기 위해 **외부 DB**가 필요해요.

### 백엔드를 두지 않은 이유
처음에는 아래와 같은 구조를 고민했어요.
```plain text
Client → Backend Server → Database
```

하지만 이 프로젝트는 아래와 같은 특징이 있어 별도의 서버를 두는 것은 **오버엔지니어링**이라 판단했어요.
- 복잡한 비즈니스 로직이 없음
- 비용 최소화 필요
- 개인 블로그 규모

**따라서 Supabase를 사용하기로 선택했어요 이유는 크게 3가지에요.**
- **PostgreSQL 기반**
- **anon key + RLS 보안 모델**
- **Vault + security definer 함수**

## 📦 PostgreSQL
Firebase와 같은 NoSQL이 아니라 **관계형 DB**를 그대로 사용할 수 있다는 점이 가장 큰 장점이었어요.
### 가능해진 것들
- 테이블 간 관계 설정
- 트랜잭션 처리
- 복잡한 SQL 작성
- 함수 등록 가능
- 원자적 연산 처리

예를 들어 방문자 중복 체크는 다음처럼 처리할 수 있었어요.
> INSERT가 실제로 발생했는지를 SQL 함수 하나로 처리

이 덕분에 클라이언트에서 중복 체크 로직을 둘 필요가 없다!!

## 🔐 RLS
**Supabase**는** 두 가지 키**를 제공해요.

| **키 종류** | **설명** |
| ---- | ---- |
| `anon` 키 | 제한된 권한을 가진 키로 클라이언트에서 사용하는 공개키.  |
| `service_role` 키 | 권한 수준이 높은 키로 모든 RLS 정책을 우회하여 DB에 직접 접근할 수 있는 비밀키로 클라이언트에 노출되면 안되고 신뢰가능한 백엔드 부분에서 사용 |

`anon` 키가 노출되어도 괜찮은 이유가 바로 **RLS(Row Level Security)** 예요.

💡 <span class="text-red">**RLS**</span>**는 PostgreSQL의 기능이에요!**
> 테이블은 사용자 단위로 일반 쿼리로 반환하거나 데이터 수정 명령으로 어떤 행을 반환하거나 삽입, 업데이트 또는 삭제할 수 있는지 제한하는 행 보안 정책(***row security policies****) *을 가질 수 있어요.

- 정책이 없으면 모든 행 접근 가능
- 각 정책은 테이블에 연결되어 있고 테이블에 접근할 때마다 정책이 실행
- 조건 불충족 시 결과 반환이 되지 않음

**간단한 예시**
- `account` 테이블에 대해 정책을 만들어 `manager`만 행에 접근할 수 있어요. 
```sql
CREATE TABLE accounts (manager text, company text, contact_email text);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_managers ON accounts TO managers
    USING (manager = current_user);
```


🚀 따라서 **RLS(Row Level Security)을 이용하여 백엔드 없이 보안을 처리할 수 있어요.**
- `anon` 키가 클라이언트에 노출되더라도 RLS 정책으로 직접적인 데이터 조작을 막을 수 있어요.

이번 프로젝트를 진행하면서는 아래 원칙으로 **RLS**를 설계했어요.
- **읽기(SELECT)**: 누구나 가능 (`using (true)`)
- **쓰기, 수정, 삭제**: `anon` 키로는 직접 불가 (`using (false)` 또는 `with check (false)`)
- **데이터 변경**: 반드시 `security definer` 함수(RPC)를 통해서만 가능
```sql
-- 예시: 댓글은 누구나 읽을 수 있다!
create policy "댓글 읽기" on comments
  for select using (true);

-- 직접 삽입은 불가능하고 함수를 통해서만 가능
create policy "댓글 쓰기 차단" on comments
  for insert with check (false); -- 직접 INSERT 차단
```


## 🔒 **security definer**
PostgreSQL 함수는 다음 두 가지 방식으로 실행돼요.
- SECURITY INVOKER (기본)
- SECURITY DEFINER (함수 생성자의 권한으로 실행)
저는 **SECURITY DEFINER** 방식을 사용했어요.

### 🤔 왜 SECURITY DEFINER가 필요한가?
`anon` 키는 **RLS** 정책에 의해 `INSERT` 처리가 차단돼요.

하지만 다음과 같은 구조를 사용한다면!!
```plain text
Client → RPC 호출 → DB 함수 → 실제 INSERT
```

클라이언트는 직접 `INSERT`하지 않지만 함수는 DB 소유자 권한으로 실행되므로 `INSERT` 가 가능해요.

**예시: 댓글 저장 함수**
```sql
create function save_comment(...)
returns void
language plpgsql
security definer
as $$
begin
  -- 실제 INSERT 수행
end;
$$;
```

## 🔑 Vault - 민감 정보 보호
이번 프로젝트에서 관리자(블로그 주인) 기능들로 아래와 같은 기능들이 있었어요.
- 미니룸 설정
- BGM 변경
- 상태 메시지 변경

각 기능들은 비밀번호 검증이 필요했고 아래와 같은 문제가 있었어요.
- 클라이언트에 두면 안 됨
- 환경변수에 두기 애매함
- DB 테이블에 평문 저장 위험

💡 **DB 내부 암호화 저장소**인 **Vault** 기능을 사용

어드민 비밀번호는 **Supabase** **Vault**에 암호화해서 저장하고 함수 내부에서만 꺼내서 비교하도록 했어요.
```sql
select vault.create_secret('your_password', 'admin_password');
```


**검증 함수**
```sql
create or replace function check_admin_password(p_password text)
returns boolean
security definer
as $$
declare
  stored_password text;
begin
  select decrypted_secret
  into stored_password
  from vault.decrypted_secrets
  where name = 'admin_password';

  return stored_password = p_password;
end;
$$ language plpgsql;
```


**모든 관리자 함수에서 검증**
```sql
if not check_admin_password(p_password) then
  raise exception 'unauthorized';
end if;
```


🚀 이런 방식을 통해서 **Vault로 민감한 값을 암호화해서 관리하고** **민감한 로직은 DB 함수 안에 숨길 수 있어요.**
## 💡 최종 구조
### 클라이언트 설정
```typescript
// 클라이언트는 anon 키만 사용
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```


⚙️ **.env**
```plain text
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```


### 실제 동작 흐름
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F027e4a4b-689e-45ce-86cc-5535d7747225%2Fimage.png?table=block&id=319d67b9-9e80-8094-94e4-f34e4a9e841f&cache=v2" alt="image" width="828" height="910" loading="lazy" />

### 🚀 정리

| 위험한 상황 | 결과 |
| ---- | ---- |
| anon 키 탈취 | 직접 INSERT 불가 |
| REST API 직접 호출 | RLS 정책 차단 |
| 관리자 기능 호출 | Vault 비밀번호 검증 |

별도 백엔드 서버 없이 **Supabase**를 이용하여 비용을 최소화하면서 PostgreSQL의 강력한 기능을 활용하여 `RLS + SECURITY DEFINER + Vault` 조합으로 안전한 동적 데이터 처리 구조 구현할 수 있었어요.

## 📚 Ref.
<span class="inline-link" data-url="https://supabase.com/docs/guides/database/postgres/row-level-security" data-domain="supabase.com"></span>
<span class="inline-link" data-url="https://supabase.com/docs/guides/api/api-keys" data-domain="supabase.com"></span>
<span class="inline-link" data-url="https://www.postgresql.org/docs/current/ddl-rowsecurity.html" data-domain="postgresql.org"></span>
