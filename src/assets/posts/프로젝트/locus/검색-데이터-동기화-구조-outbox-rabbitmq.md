---
id: "317d67b9-9e80-80ce-84f5-feaa3e021ed5"
title: "검색 데이터 동기화 구조 [Outbox & RabbitMQ] "
slug: "검색-데이터-동기화-구조-outbox-rabbitmq"
category: "프로젝트"
tags: ["RabbitMQ","Elasticsearch","MessageQueue","OutboxPattern"]
date: "2026-03-02"
createdAt: "2026-03-02T06:26:00.000Z"
excerpt: "⚠️ 동기화의 근본적인 문제 단순한 방식의 한계 처음에는 단순히 API 요청 처리 과정에서 직접 Elasticsearch를 호출하는 방식도 고려했습니다. 1️⃣ 트랜잭션 경계가 불..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fac945b5a-e363-432d-9b0e-88ec4797350b%2Fimage.png?table=block&id=317d67b9-9e80-8051-a3d9-eb358328a0d1&cache=v2"
groupId: "314d67b9-9e80-80af-9f95-cd3e58daf439"
groupSlug: "locus"
lastEdited: "2026-04-29T04:34:00.000Z"
---

## ⚠️ 동기화의 근본적인 문제
### 단순한 방식의 한계
처음에는 단순히 API 요청 처리 과정에서 직접 Elasticsearch를 호출하는 방식도 고려했습니다.

```plain text
사용자 요청 → PostgreSQL 저장 → Elasticsearch 인덱싱 → 응답
```


1️⃣ **트랜잭션 경계가 불명확**
PostgreSQL 트랜잭션이 성공했는데 Elasticsearch 호출이 실패하면 어떻게 해야 할까요?
- PostgreSQL을 롤백? → Elasticsearch 장애가 비즈니스 데이터 생성을 막는 것
- 그렇면 그대로 둔다면? → 데이터 불일치 문제 발생

Elasticsearch 장애는 **검색 문제**이지 **비즈니스 데이터 정합성 문제**가 아닙니다. 
따라서 PostgreSQL 롤백은 적절하지 않다고 생각했습니다.

2️⃣ **네트워크 장애 시 데이터 불일치**
```plain text
PostgreSQL 저장 ✅ 성공
      ↓
(네트워크 타임아웃 발생)
      ↓
Elasticsearch 인덱싱 ❌ 실패
```

PostgreSQL에는 저장되었지만 Elasticsearch에는 반영되지 않은 상황 
- 사용자는 기록을 만들었는데 검색되지 않습니다.

3️⃣** 장애 전파**
Elasticsearch가 완전히 다운된 경우 사용자는 기록 자체를 만들 수 없게 됩니다. 
검색 시스템의 장애가 우리 서비스의 핵심 기능(기록 작성)까지 막는 상황이 발생하게 됩니다.

4️⃣ **성능 문제**
Elasticsearch 응답을 기다리는 동안 사용자도 함께 기다려야 합니다. 
따라서 Elasticsearch에서의 처리가 느려지면 API 응답도 느려집니다.

### 💡 원하는 것
이런 문제들을 해결하기 위해서는 다음 조건을 만족해야 한다고 생각했습니다.
- **원자성**: 기록 저장과 동기화 이벤트 발행이 함께 성공하거나 함께 실패
- **안정성**: Elasticsearch 장애가 기록 생성을 막지 않음
- **복구 가능**: 실패한 동기화는 재시도
- **성능**: 사용자 응답 시간에 영향 없음

## 📦 Transaction Outbox Pattern
### 💡 핵심 아이디어
> 외부 시스템 연동을 트랜잭션 안에서 하지 말고 연동해야 한다는 사실만 트랜잭션 안에 기록하자

- PostgreSQL의 <span class="text-blue">**트랜잭션 원자성**</span>을 활용해 비즈니스 데이터와 동기화 이벤트가 항상 함께 저장되도록 보장
- 비즈니스 데이터(기록)와 동기화 이벤트를 **같은 트랜잭션**에 저장
- 나중에 별도 프로세스가 이벤트를 읽어서 **외부 시스템**(Elasticsearch)에 전달

## ⏩ 동작 흐름
### 1️⃣ **API 요청 처리 (사용자가 기록을 생성)**
```plain text
[하나의 트랜잭션 안에서]
1. records 테이블에 새 기록 INSERT
2. outbox 테이블에 동기화 이벤트 INSERT
→ COMMIT

[사용자에게 즉시 응답 200 OK]
```


**핵심은 하나의 트랜잭션**이라는 것입니다!! 
- 기록과 이벤트 둘 다 성공하거나, 둘 다 실패
- 기록은 저장됐는데 이벤트가 누락되는 일이 없음
- 이벤트만 저장되고 기록은 실패하는 일도 없음

이를 통해서 사용자는 Elasticsearch 동기화를 전혀 기다리지 않고 즉시 응답을 받게 됩니다.

### 2️⃣ **이벤트 발행 (Outbox Publisher)**
> 별도의 백그라운드 프로세스가 주기적으로 동작 


```plain text
[5초마다 실행되는 Cron Job]

1. Outbox 테이블에서 status = 'PENDING'인 이벤트 조회
2. 각 이벤트를 RabbitMQ로 발행
3. 성공하면 status = 'DONE'으로 업데이트
4. 실패하면 retry_count 증가
```

이 프로세스는 **PostgreSQL**에서 읽어서 **RabbitMQ**로 전달하는 역할을 하게 됩니다.

### 3️⃣ **Elasticsearch 동기화**
> **RabbitMQ Consumer**가 메시지를 받아서 실제 동기화를 수행


```plain text
[RabbitMQ에서 메시지 수신]
     ↓
[이벤트 타입 확인]
     ↓
CREATED → Elasticsearch에 새 문서 추가
UPDATED → Elasticsearch 문서 업데이트
DELETED → Elasticsearch 문서 삭제
```


## 🐇 RabbitMQ를 활용한 이벤트 전달
### 🤔 왜 Message Queue가 필요한가?
Outbox에서 바로 Elasticsearch를 호출하지 않고 중간에 RabbitMQ를 두었을까요?!?


| 이유 | 설명 |
| ---- | ---- |
| 장애 격리 | Elasticsearch가 다운되어도 메시지는 RabbitMQ에 안전하게 보관됩니다. 따라서 ES가 복구되면 쌓여있던 메시지들을 순서대로 처리하면 됩니다. |
| 재시도 | RabbitMQ는 메시지 처리 실패 시 자동으로 재시도하는 메커니즘을 제공합니다. 일시적인 네트워크 장애는 자동으로 복구될 수 있습니다. |
| 확장성 | 동기화 요청이 많아지면 Consumer를 여러 개 띄워서 병렬 처리할 수 있습니다. Outbox Publisher는 그대로 두고 Worker만 늘리면 됩니다. |
| 모니터링 | 큐에 쌓인 메시지 수를 보면 동기화 지연 상태를 파악 가능 |

물론 **인프라 관리 복잡도**는 증가합니다. 
RabbitMQ를 추가로 운영해야 하니까요. 하지만 안정성 측면에서 충분히 가치있는 선택이라고 판단했습니다.

### At-Least-Once Delivery
네트워크는 불안정할 수 있기 때문에 다음과 같은 상황이 발생할 수 있습니다
```plain text
메시지를 RabbitMQ로 발행
    ↓
RabbitMQ에 도착 ✅
    ↓
응답 패킷이 네트워크에서 유실
    ↓
Publisher는 타임아웃으로 실패로 판단
    ↓
같은 메시지 다시 발행
```

결과적으로 **같은 메시지가 여러 번 전달**될 수 있습니다. 이것이 **At-Least-Once Delivery 입니다.**
> **"메시지를 최소 한 번은 전달하지만 중복될 수 있다"**


따라서 메시지를 받는 쪽(Consumer)이 **멱등하게** 동작해야 합니다.

## ✅ 멱등성 보장
### Elasticsearch의 멱등한 특성
다행히 Elasticsearch는 기본적으로 멱등한 동작을 합니다.

**문서 생성 및 수정**
- 같은 ID로 여러 번 인덱싱 → 덮어쓰기
- `CREATED` 이벤트를 2번 처리 → 같은 결과
- `UPDATED` 이벤트를 3번 처리 → 최신 상태로 덮어쓰기

**문서 삭제**
- 같은 ID를 여러 번 삭제하면 → 첫 번째만 성공 나머지는 404
- 404는 무시하도록 처리
결과적으로 메시지가 중복 전달되어도 **Exactly-Once Processing **과 동일한 효과를 얻을 수 있습니다.

## 💣 장애 대응 전략
### 자동 재시도 메커니즘
동기화에 실패하면 어떻게 될까요?

1️⃣ **1차 실패**: retry_count = 1, status = RETRY
- 5초 후 다시 시도

2️⃣ **2차 실패**: retry_count = 2, status = RETRY
- 5초 후 다시 시도

5️⃣ **5차 실패**: retry_count = 5, status = DEAD
- 더 이상 자동 재시도하지 않음
- 개발자에게 알림 발송 (TODO)

### ☠️ Dead Letter Queue (DLQ)
5번 재시도해도 실패하는 이벤트는 **DEAD** 상태로 마킹이 됩니다.
이런 이벤트들은 **자동으로 처리하지 않도록 했습니다.**
- 계속되는 재시도로 시스템 부하를 주지 않음
- 명확히 실패한 것으로 표시

👀 **개발자가 직접 확인합니다**
- Outbox 테이블에서 status = 'DEAD' 조회
- 실패 원인 파악 (payload 확인)
- 수동으로 복구하거나 데이터 정합성 체크

👀 **추후 개선 방향**
- Slack 알림 자동 발송
- 관리자 대시보드에서 재처리 버튼 제공 

## 👷‍♂️ 전체 아키텍처 정리
최종적으로 완성된 동기화 구조는 다음과 같습니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fac945b5a-e363-432d-9b0e-88ec4797350b%2Fimage.png?table=block&id=317d67b9-9e80-8051-a3d9-eb358328a0d1&cache=v2" alt="image" width="1294" height="688" loading="lazy" />


## 🤔 트레이드오프와 선택
### 복잡도 증가
- Outbox 테이블 추가
- Cron Job 스케줄링 관리
- RabbitMQ 인프라 운영

처음에 그냥 API에서 바로 Elasticsearch 호출하는 방식보다는 훨씬 복잡해졌습니다…

### 얻은 것
하지만 복잡도를 감수할 만한 가치가 있었다고 생각합니다.

1️⃣ **데이터 일관성 보장**
- PostgreSQL과 Elasticsearch가 항상 동기화됨
- 트랜잭션으로 이벤트 누락 방지
- 모든 변경사항이 추적 가능

2️⃣ **시스템 안정성 향상**
- Elasticsearch 다운이 서비스 중단으로 이어지지 않음
- 일시적 장애는 자동 복구
- 영구 실패는 명확하게 추적

3️⃣ **성능 개선**
- 사용자는 동기화를 기다리지 않음
- API 응답 시간 일정하게 유지

## ↗️ 이후 처리해야할 내용
### Outbox 테이블 정리
Outbox 테이블은 계속 쌓이기 때문에 정리가 필요합니다.
두 가지 방법을 생각하고 있습니다.
- **완료된 이벤트 주기적으로 삭제**
- 완료된 이벤트를 `‘DONE’`으로 저장하지 않고 바로 삭제

현재는 아직 데이터가 많지 않아 정리를 하지 않고 있지만 꼭 필요하다고 생각합니다.

### 동기화 지연 모니터링
5초마다 Cron이 실행되지만 처리할 이벤트가 많으면 지연이 발생할 수 있습니다.

**모니터링 해 볼 지표**
- Outbox에 PENDING 상태로 남아있는 이벤트 수
- 가장 오래된 PENDING 이벤트의 생성 시간
- RabbitMQ 큐에 쌓인 메시지 수
- Consumer의 처리 속도
이런 지표들로 시스템 상태를 파악하고 필요하면 Consumer를 늘리는 등의 조치를 취할 수 있을 것 같습니다.

## 🖐️ 마치며
검색 기능 하나를 만들면서 많은 고민을 하고 설계를 한 후 구현을 해보았습니다.
처음에는 "단순하게 만들자"라고 생각했지만 실제로 운영할 시스템을 만들다 보니 고려해야 할 것들이 많았던 것 같습니다.
제가 한 방식이 맞는 방식일지는 모르겠지만 그래도 현재 저희 서비스에는 나쁘지 않은 선택이였다고 생각합니다!

