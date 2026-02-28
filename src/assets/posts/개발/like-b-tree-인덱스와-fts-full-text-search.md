---
id: "311d67b9-9e80-8024-811e-da2503ec108a"
title: "LIKE + B+Tree 인덱스와 FTS(Full-Text Search)"
slug: "like-b-tree-인덱스와-fts-full-text-search"
category: "개발"
tags: ["데이터베이스","MySQL"]
date: "2026-02-28"
excerpt: "🌲 B+ Tree 자료구조 대부분의 RDBMS(MySQL, PostgreSQL 등)는 기본 인덱스 구조로 B+Tree를 사용합니다. | Leaf Node | 실제 데이터의 키 값..."
groupId: ""
lastEdited: "2026-02-28T04:13:00.000Z"
---

## 🌲 B+ Tree 자료구조

대부분의 RDBMS(MySQL, PostgreSQL 등)는 기본 인덱스 구조로 **B+Tree**를 사용합니다. 


| Root Node | 최상위 노드. 출발점 |
| ---- | ---- |
| Branch / Internal Node  | 다음 노드로 가는 경로 정보(포인터만 가짐) |
| Leaf Node | 실제 데이터의 키 값과 레코드 주소(혹은 데이터 자체)를 가짐.
모든 리프노드는 양방향 연결 리스트로 연결되어 Range scan에 유리 |

트리가 한쪽으로 치우치지 않고 항상 일정한 깊이(Depth)를 유지하므로 데이터가 아무리 많아도 탐색 시간 복잡도가 O(log n)으로 보장

### B+Tree의 탐색 원리 
> 데이터베이스는 어떻게 데이터를 찾는지?!


B-Tree의 중요한 조건은 `데이터가 인덱스 키를 기준으로 항상 정렬되어 있다`는 것입니다. 
따라서 탐색 과정은 아래와 같습니다.
1. 검색 시작 시 Root Node의 값과 검색어를 비교합니다.
2. 검색어가 노드 값보다 작으면 왼쪽 포인터로, 크면 오른쪽 포인터로 이동합니다.
3. 이 과정을 반복하여 Leaf Node에 도달하면 실제 데이터가 있는 물리적 주소를 얻습니다.

## 📌 B+Tree와 `LIKE` 연산
### 인덱스를 탈 수 있는 경우와 없는 경우
인덱스 키가 문자열일 경우 데이터베이스는 문자열을 **왼쪽에서 오른쪽으로** 한 글자씩 비교하며 정렬을 합니다.

**✅  ****`LIKE '고범%'`**** → **<span class="text-blue">**Index Range Scan**</span>
- 트리가 '가나다' 순으로 정렬되어 있으므로 DB는 '홍'으로 시작하는 데이터가 어디서 시작해서 어디서 끝나는지 트리 구조를 타고 단번에 찾아낼 수 있습니다. 
- (시작점과 끝점만 찾아서 리프 노드의 연결 리스트를 쭉 읽으면 됩니다.)

**❌ ****`LIKE '%범석'`**** 또는 ****`LIKE '%범석%'`****  → **<span class="text-blue">**Full Table Scan**</span>
- 시작 글자가 무엇인지 모르기 때문에 사전의 정렬 방식을 전혀 활용할 수 없습니다. 
- 결국 DB는 트리를 무시하고 테이블의 처음부터 끝까지 모든 데이터를 뒤져서 '길동'이 포함되었는지 일일이 확인해야 합니다. 

## ⭐ **FTS(Full-Text Search)를 통한 LIKE 문제 해결**
이러한 `LIKE` 연산의 문제를 해결하기 위해 RDB(PostgreSQL, MySQL 등)도 **FTS(Full-Text Search, 전문 검색)** 기능을 제공합니다.

### 🔍 FTS란
긴 텍스트 데이터를 단어(Token) 단위로 쪼개어 검색에 최적화된 구조로 저장하는 기술입니다. 
FTS는 내부적으로 **역색인(Inverted Index) **구조를 사용합니다. 
일반 인덱스가 `문서 ID → 텍스트` 방향을 가리킨다면 역색인은  `단어 → 문서 ID` 형태로 데이터를 저장해 텍스트가 포함된 문서를 빠르게 찾아냅니다.

### 📕 한글 처리 (N-gram 파서)
영어는 띄어쓰기 기준으로 단어를 쉽게 분리할 수 있지만 한글은 교착어(조사, 어미 등) 특성상 단순 띄어쓰기 분리가 어렵습니다. 
이를 해결하기 위해 MySQL 등에서는 주로 **N-gram** 방식을 사용합니다.

> 🤔 **N-gram이란?** 
> 텍스트를 형태소(의미) 단위가 아닌 정해진 글자 수(N)만큼 기계적으로 잘라서 토큰을 만드는 방식입니다.
> - **예시 (Bi-gram, N=2):** "치킨이닭" ➡ `치킨`, `킨이`, `이닭`으로 쪼개어 역색인에 저장합니다.


빠짐없이 검색할 수 있다는 장점이 있지만 무의미한 단어(`킨이`)가 인덱싱되어 공간을 많이 차지한다는 단점이 있습니다.

## 🖥️ RDB 일반 인덱스 vs FULLTEXT 인덱스 성능 비교
실제 MySQL 환경에서 100만 건의 데이터를 넣고 쿼리 실행 계획과 속도를 비교해 보았습니다.

### 실습 데이터 세팅
```sql
CREATE DATABASE fts_test;
USE fts_test;

CREATE TABLE search_test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content TEXT
);

-- 1,000,000 건 더미 데이터 삽입 (CTE 활용)
SET @@cte_max_recursion_depth = 1000000;

INSERT INTO search_test (title)
WITH RECURSIVE cte (n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM cte WHERE n < 1000000
)
SELECT CONCAT('RDB FTS 검색 테스트 데이터 ', n) FROM cte;

-- 일반 B-Tree 인덱스 추가
CREATE INDEX idx_title_btree ON search_test(title);

-- 테스트용 타겟 데이터 삽입
INSERT INTO search_test (title) VALUES ('오늘 저녁은 치킨이닭!');
```


### **LIKE ****`‘_%’`**** 실행계획 확인**
```sql
EXPLAIN SELECT * FROM search_test WHERE title LIKE '오늘 저녁은%';
```


**결과**

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fa3ee440b-8de8-488c-9c53-d4b1314d6670%2Fimage.png?table=block&id=311d67b9-9e80-80f9-8aaf-c2d952c3ad5f&cache=v2" alt="image" width="1938" height="294" loading="lazy" />

<span class="text-blue">**`type: range`**</span>
- B-Tree 인덱스(`idx_title_btree`)를 정상적으로 타고(`range`) 매우 빠르게 검색

### LIKE `‘%_%’` 실행계획 확인
```sql
EXPLAIN SELECT * FROM search_test WHERE title LIKE '%치킨%';
```


**결과**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fdc114d8a-2c81-4f30-b093-e00f4b991a31%2Fimage.png?table=block&id=311d67b9-9e80-8020-bf00-f6b76fefa575&cache=v2" alt="image" width="1728" height="268" loading="lazy" />

<span class="text-blue">**`type: ALL`**</span>
인덱스가 존재하지만 옵티마이저는 인덱스를 포기하고 100만 건을 다 뒤지는 `Full Table Scan(ALL)`을 선택합니다. 
이는 해당 LIKE 연산이 B-Tree의 정렬 구조를 활용할 수 없기 때문입니다.

### FTS(전문 검색) 적용 후 실행계획 확인
```sql
-- ngram 파서를 사용하는 FULLTEXT 인덱스 추가
CREATE FULLTEXT INDEX idx_title_fts ON search_test(title) WITH PARSER ngram;

-- 전문 검색 쿼리 실행
EXPLAIN SELECT * FROM search_test 
WHERE MATCH(title) AGAINST('치킨' IN BOOLEAN MODE);
```


**결과**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F3ee21630-8886-473d-9c48-2c01e81a10ed%2Fimage.png?table=block&id=311d67b9-9e80-80a3-ae9e-cb553d71b786&cache=v2" alt="image" width="1956" height="322" loading="lazy" />

<span class="text-blue">**`type: fulltext`**</span>
- `FULLTEXT` 인덱스를 타면서 역색인을 사용하게 됩니다.

### 🆚 실제 쿼리 실행 시간 측정 (Profiling)
> ⚠️ **성능 테스트 전 캐시(Cache) 및 InnoDB Buffer Pool**
> 정확한 성능 측정을 위해서는 쿼리 캐시 기능 또는 메모리에 올려지는 캐시를 잘 확인해야 합니다.
> 
> **Query Cache (쿼리 캐시)**
> - MySQL 5.7 이하에서는 `SELECT SQL_NO_CACHE ...` 옵션을 주어 쿼리 캐시를 우회했습니다.
> - **MySQL 8.0부터는 쿼리 캐시 기능 자체가 완전히 삭제**되었습니다!
> 
> **InnoDB Buffer Pool & OS Cache**
> - 디스크에서 읽어온 데이터 페이지(블록)를 메모리에 올려두는 캐시는 여전히 존재합니다.
> - 따라서 첫 번째 쿼리 실행보다 두 번째 실행이 디스크 I/O가 줄어들어 훨씬 빠릅니다.

따라서 정확히 비교하기 위해 MySQL 서버를 재시작하면서 테스트를 하고자 합니다.

```sql
-- 프로파일링 기능 활성화
SET profiling = 1;

-- 일반 LIKE 양방향 검색 실행
SELECT * FROM search_test WHERE title LIKE '%치킨%';
-- 결과: 1 row fetched

-- FULLTEXT 인덱스 검색 실행
SELECT * FROM search_test WHERE MATCH(title) AGAINST('치킨' IN BOOLEAN MODE);
-- 결과: 1 row fetched

-- 프로파일링 기록 확인
SHOW PROFILES;
```


**결과**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fbd8eb10e-a738-42f3-85d2-b8e92f6c8772%2Fimage.png?table=block&id=311d67b9-9e80-802a-ad33-fcaef97ae245&cache=v2" alt="image" width="1390" height="672" loading="lazy" />



| **Query_ID** | **Duration (초)** | **Query** |
| ---- | ---- | ---- |
| 1 | **0.75667100** | `SELECT * FROM search_test WHERE title LIKE '%치킨%'` |
| 2 | **0.00502025** | `SELECT * FROM search_test WHERE MATCH(title) AGAINST('치킨' IN BOOLEAN MODE)` |

100만 건의 데이터 기준으로 일반 `LIKE` 풀 스캔은 약 <u>**0.75초(750ms)**</u>가 소요되었으나 역색인을 활용한 FTS는 <u>**0.005초(5ms)**</u>만에 결과를 반환했습니다. 
- **150배**

## 📚 Ref.
<span class="inline-link" data-url="https://dev.mysql.com/doc/refman/8.0/en/fulltext-restrictions.html" data-domain="dev.mysql.com"></span>
<span class="inline-link" data-url="https://dev.mysql.com/doc/refman/8.0/en/fulltext-search-ngram.html" data-domain="dev.mysql.com"></span>

