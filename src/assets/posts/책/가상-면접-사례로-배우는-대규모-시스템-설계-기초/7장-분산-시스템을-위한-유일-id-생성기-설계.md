---
id: "314d67b9-9e80-80c2-bc7a-e0398392c183"
title: "7장 - 분산 시스템을 위한 유일 ID 생성기 설계"
slug: "7장-분산-시스템을-위한-유일-id-생성기-설계"
category: "책"
tags: ["id"]
date: "2026-02-27"
createdAt: "2026-02-27T06:56:00.000Z"
excerpt: "1️⃣ 문제 이해 및 설계 범위 확정 질문을 통해서 요구사항을 이해하고 모호함을 해소하자. ID는 유일해야 한다. ID는 숫자로만 구성되어야 한다. ID는 64비트로 표현될 수 있..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F77d81796-06bd-4f1a-8bc3-3ecf858b7d60%2Fimage.png?table=block&id=314d67b9-9e80-815e-873a-c24c960e4d25&cache=v2"
groupId: "314d67b9-9e80-8046-9fb4-da579c494117"
groupSlug: "가상-면접-사례로-배우는-대규모-시스템-설계-기초"
lastEdited: "2026-03-01T06:10:00.000Z"
---

## 1️⃣ 문제 이해 및 설계 범위 확정
질문을 통해서 요구사항을 이해하고 모호함을 해소하자.
- ID는 **유일**해야 한다.
- ID는 **숫자**로만 구성되어야 한다.
- ID는 64비트로 표현될 수 있는 값이어야 한다.
- ID는 **발급 날짜에 따라 정렬** 가능해야 한다.
- **초당 10,000**개의 ID를 만들 수 있어야 한다.

## 2️⃣ 개략적 설계안 제시 및 동의 구하기
**분산 시스템에서 유일성이 보장되는 ID**를 만드는 방법은 여러 가지이다.
- **다중 마스터 복제 (Multi-master replication)**
- **UUID (Universally Unique Identifier)**
- **티켓 서버 (ticket server)**
- **트위터 스노플레이트 접근법 (snowflake)**

### ©️ 다중 마스터 복제
> `auto_increment` 기능을 활용하는 방법


**ID 값을 구할 때 1만큼 증가시켜 얻는 것이 아닌 ****`k`**** 만큼 증가시킨다.**
- `k`는 사용하고 있는 데이터베이스 서버의 수

💡 이렇게 하면 **규모 확장성 문제**를 어느 정도 해결할 수 있다.
- 데이터베이스 수를 늘리면 초당 생산 가능 ID 수도 늘릴 수 있기 때문이다.

💣 **단점**
- 여러 데이터 센터에 걸쳐 규모를 늘리기 어렵다.
- ID의 유일설은 보장되겠지만 그 값이 시간 흐름에 맞추어 커지도록 보장할 수 없다.
- **서버를 추가하거나 삭제할 때도 잘 동작하도록 만들기 어렵다.**

### 🆔 UUID
컴퓨터 시스템에 저장되는 정보를 유일하게 식별하기 위한 128비트 수
- 독립적으로 생성이 가능.


| 장점 | 단점 |
| ---- | ---- |
| UUID를 만드는 것은 단순. | ID가 128비트로 길다. |
| 서버 사이의 조율이 필요 없어 동기화 이슈도 없다. | ID를 시간순으로 정렬할 수 없다. |
| 각 서버에서 ID를 알아서 만드는 구조로 규모 확장이 쉽다. | ID에 숫자가 아닌 값이 포함될 수 있다. |

### 🎟️ 티켓 서버
티켓 서버는 유일성이 보장되는 ID를 만들어 내는 데 쓰일 수 있는 방법 중 하나이다.
- `플리커`는 분산 기본 키를 만들어 내기 위해 이 기술을 사용

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F77d81796-06bd-4f1a-8bc3-3ecf858b7d60%2Fimage.png?table=block&id=314d67b9-9e80-815e-873a-c24c960e4d25&cache=v2" alt="image" width="1158" height="336" loading="lazy" />


💡 `auto_increment` 기능을 갖춘 **데이터베이스 서버(티켓 서버)를 중앙 집중형으로 하나만 사용하는 것.**


| 장점 | 단점 |
| ---- | ---- |
| 유일성이 보장되는 숫자로만 구성된 ID를 쉽게 만들 수 있다. | 티켓 서버가 `SPOF`가 된다. |
| 구현하기 쉽고 중소 규모 애플리케이션에 적합하다. | 이슈를 피하기 위해서는 티켓 서버를 여러 대 준비해야 한다. |
|  | 티켓 서버가 여러대라면 동기화 문제가 발생 |


### ❄️ 트위터 스노플레이크 접근법
트위터는 <span class="text-blue">`스노플레이크(snowflake)`</span>라는 **ID 생성 기법**을 사용한다.

이 방법은 이번 장에서의 문제 요구사항을 만족시킬 수 있다 🚀

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F15cb6281-5aaa-4163-8a5d-69ccdcc0860c%2Fimage.png?table=block&id=314d67b9-9e80-811f-8a77-c46d53399765&cache=v2" alt="image" width="1218" height="230" loading="lazy" />



| 타입 | 비트 | 설명 |
| ---- | ---- | ---- |
| 사인 비트(sign) | 1비트 | 음수와 양수를 구별하는데 사용. 미래 확장을 위함 |
| 타임스탬프 | 41비트 | `Epoch`(기준 시각. 2010-11-04 01:42:54 UTC)이후 경과한 밀리초 |
| 데이터센터 ID | 5비트 | 최대 32개의 데이터센터 구분가능 |
| 서버 ID | 5비트 | 데이터센터당 32개의 서버를 사용가능 |
| 일련번호 | 12비트 | 각 서버에서 ID를 생성할 때 일련번호를 1만큼 증가. 1밀리초가 경과할 때마다 0으로 초기화. |


## 3️⃣ 상세 설계
**트위터 스노플레이크를 통해 상세한 설계를 진행**
- 데이터 센터 ID와 서버 ID의 경우는 시스템이 시작할 때 결정되며 **시스템 운영중에는 바뀌지 않는다.**
  - 데이터 센터 ID나 서버 ID를 실수로 바꾸게 되면 **ID 충돌**이 발생할 수 있다.
- 따라서 서버 증설, 설정 변경 시에는 반드시 **ID 중복 여부를 철저히 검증**해야 한다.

### ⏱️ 타임스탬프
타임스탬프 값은 ID 생성기가 동작할 때 <u>**실시간으로 계산되는 값**</u>이다.
- `41비트`
- 시간의 흐름에 따라 큰 값을 갖게되어 ID는 시간 순으로 정렬이 가능하게 된다.

**ID 구조에서 UTC 시각을 추출할 수 있다.**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fb916085a-fc77-4ef2-83a3-4b35c9655c7e%2Fimage.png?table=block&id=314d67b9-9e80-8194-832a-d3cee881d89c&cache=v2" alt="image" width="996" height="430" loading="lazy" />


41비트로 표현할 수 있는 타임스탬프의 최댓값은 **2199023255551 밀리초로 대략 69년**이다.
- 기원 시각을 현재에 가깝게 맞추면 오버플로가 발생하는 시점을 늦출 수 있다.
- 69년이 지나면 기원 시각을 바꾸거나 ID 체계를 다른 것으로 이전

### 🔢 일련번호
일변번호는 **12비트로 4096(2의 12제곱)**개의 값을 가질 수 있다.
- 동일한 밀리초내에서 하나 이상의 ID를 만들어낸 경우에만 0보다 큰 값을 갖게 된다.
- 즉, 1밀리초 안에 최대 4096개의 ID 생성이 가능

# 📚 Ref.
<span class="inline-link" data-url="https://product.kyobobook.co.kr/detail/S000001033116" data-domain="product.kyobobook.co.kr"></span>
<span class="inline-link" data-url="https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/" data-domain="code.flickr.net"></span>
