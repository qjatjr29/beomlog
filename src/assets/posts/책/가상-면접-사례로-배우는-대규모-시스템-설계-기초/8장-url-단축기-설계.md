---
id: "314d67b9-9e80-8016-97e8-caefdfc84e46"
title: "8장 - URL 단축기 설계"
slug: "8장-url-단축기-설계"
category: "책"
tags: []
date: "2026-02-27"
createdAt: "2026-02-27T06:59:00.000Z"
excerpt: "🤔 단축 URL을 사용하는 이유? 이 글을 읽기 전에 왜 URL 단축기를 사용하여 단축된 URL을 사용하는지 궁금해져 한 번 정리를 해보려고 한다. 1️⃣ 문제 이해 및 설계 범..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F6c338d0a-a847-4546-8572-677a58b297b9%2Fimage.png?table=block&id=314d67b9-9e80-818f-9938-f3b5a597979b&cache=v2"
groupId: "314d67b9-9e80-8046-9fb4-da579c494117"
groupSlug: "가상-면접-사례로-배우는-대규모-시스템-설계-기초"
lastEdited: "2026-03-01T06:10:00.000Z"
---

## 🤔 단축 URL을 사용하는 이유?
이 글을 읽기 전에 왜 URL 단축기를 사용하여 단축된 URL을 사용하는지 궁금해져 한 번 정리를 해보려고 한다.


| 장점 | 설명 |
| ---- | ---- |
| 공간 절약 및 가독성  | 웹사이트 링크는 많은 공간을 차지하기 때문에 SNS 환경이나 메시지 전송시에서 불편할 수 있다. 단축 URL은 가독성이 좋게 글자 수를 절약하며 링크를 전달할 수 있다. |
| 클릭 추적 및 분석 | 언제 / 어디서 / 누가 클릭을 했는지 데이터 추적이 가능하다. (국가, 시간대, 디바이스 등) |
| 마케팅 효과 | A/B 테스트 등을 통해 어떤 메시지가 더 높은 클릭을 유도하는지 확인. 유입 경로(SNS, 이메일, 블로그 등)를 분석해 어떤 채널이 효과적인지 파악 |
| 주소 마스킹 | 원래 URL을 감춰 보안에 좀 더 유리. 민감한 정보 노출을 막음 |

## 1️⃣ 문제 이해 및 설계 범위 확정
### 단축 URL 시스템의 기본적 기능
- URL 단축: 주어진 긴 URL을 짧게 줄인다.
- URL 리다이렉션: 축약된 URL로 HTTP 요청이 오면 원래 URL로 안내
- 높은 가용성과 규모 확장성, 장애 감내

### **개략적 추정**
- **쓰기 :** 매일 1억 개 단축 URL 생성
  -  초당 1억 / 24 / 3600 = 1160개 생성
- **읽기 :** 읽기 쓰기 비율이 10 : 1이라고 가정하면 초당 11,600회 발생한다.
- URL 단축 서비스를 10년 운영한다 가정
  - 1억 * 365 * 10 = 3650 억개 레코드 보관
- 축약전 URL 평균 길이 100이라 가정 
  - 10년간 필요한 저장 용량은 100Byte * 3650억 = 36.5TB

> 📖 **장애 감내 (Fault Tolerance)**
> - 시스템의 일부에 오류, 고장이 발생해도 전체 시스템이 멈추지 않고 정상적으로 동작하거나 최소한의 기능이라도 유지하는 능력


## 2️⃣ 개략적 설계안 제시 및 동의 구하기
### API 엔드포인트
REST API로 엔드포인트를 설계

1. **URL 단축용 엔드포인트**
`POST /api/v1/data/shorten`
- 새 단축 URL을 생성하는 엔드포인트
- 인자로 단축할 URL을 실어줘야 한다.
- 반환값: 단축 URL

1. **URL 리다이렉션용 엔드포인트**
`GET /api/v1/shortUrl`
- 단축 URL에 대해서 원래 URL로 보내주기 위한 엔드포인트
- 반환값: HTTP 리다이렉션 목적지가 될 원래 URL

### URL 리다이렉션
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F6c338d0a-a847-4546-8572-677a58b297b9%2Fimage.png?table=block&id=314d67b9-9e80-818f-9938-f3b5a597979b&cache=v2" alt="image" width="1086" height="516" loading="lazy" />

위 그림은 브라우저에 단축 URL을 입력하면 무슨 일이 생기는지 보여준다.

단축 URL을 받은 서버는 그 URL을 원래 URL로 바꾸어 `301` 응답의 Location 헤더에 넣어 반환

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Ffc4cf157-5471-4f8c-88ae-b35767b622cc%2Fimage.png?table=block&id=314d67b9-9e80-81a8-8ab3-d838b230f1db&cache=v2" alt="클라이언트와 서버 사이의 통신 절차" width="868" height="826" loading="lazy" />


### 301 응답과 302 응답
301 응답과 302 응답 둘 다 리다이렉션 응답이지만 차이가 있다.

**`301 Permanently Moved`**
**해당 URL에 대한 HTTP 요청의 처리 책임이 영구적으로 Location 헤더에 반환된 URL로 이전되었다는 응답.**
영구적으로 이전되어 브라우저는 이 응답을 <u>**캐시**</u>
따라서 추후 같은 단축 URL에 요청을 보낼때 브라우저는 캐시된 원래 URL로 요청을 보내게 된다.

<span class="text-blue">**`302 Found`**</span>
**주어진 URL로의 요청이 일시적으로 Location 헤더가 지정하는 URL에 의해 처리되어야 한다는 응답.**
따라서 클라이언트의 요청은 언제나 단축 URL 서버에 먼저 보내진 이후 원래 URL로 리다이렉션

👀** 서버 부하를 줄이는 것이 중요한 경우**
- `301 Permanent Moved` 를 사용하는 것이 좋다.
- 첫 번째 요청만 단축 URL 서버로 전송될 것이기 때문

👀 **트래픽 분석이 중요한 경우**
- <span class="text-blue">`302 Found`</span> 를 사용하여 클릭 발생률이나 발생 위치를 추적하는데 좀 더 유리


URL 리다이렉션을 구현하는 가장 직관적인 방법은 <u>**해시 테이블**</u>을 사용하는 것이다.
- <u>**<단축 URL, 원래 URL>**</u> 쌍을 저장
- **원래 URL = hashTable.get(단축 URL)**
- **301 또는 302 응답 Location 헤더에 원래 URL을 넣은 후 전송**

### URL 단축
단축 URL이 `www.tinyurl.com/{hashValue}` 라고 가정
⭐ 중요한 것은 긴 URL을 해당 해시 값으로 대응시킬 해시 함수 **fx** 를 찾는 것.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fc9fcfa28-fb5e-4562-b028-1054f31177a4%2Fimage.png?table=block&id=314d67b9-9e80-81fe-9476-cdcaafc319be&cache=v2" alt="image" width="618" height="484" loading="lazy" />


**해시 함수 fx** 는 다음 요구사항을 만족해야 한다.
- 입력으로 주어지는 긴 URL이 다른 값이라면 해시 값도 달라야 한다.
- 계산된 해시 값은 원래 입력으로 주어졌던 긴 URL로 복원될 수 있어야 한다.

## 3️⃣ 상세 설계
### 데이터 모델
해시 테이블을 사용하는 것은 초기 전략으로는 괜찮지만 실제 시스템에서 사용하기에는 힘들다.
- 메모리는 유한하고 비싸기 때문

더 나은 방법은 <u>**<단축 URL, 원래 URL>**</u> 의 순서쌍을 <span class="text-blue">**`RDB`**</span>에 저장하는 것이다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F7d4b8eaa-9a61-41af-8f15-05cd155c61e3%2Fimage.png?table=block&id=314d67b9-9e80-81f6-8904-dae01d777151&cache=v2" alt="간단한 테이블 설계" width="408" height="304" loading="lazy" />

- `id`, `shortURL`, `longURL` 세 개 컬럼

### 해시 함수
해시 함수는 원래 URL을 단축 URL으로 변환하는데 사용한다.
해시 함수가 계산하는 단축 URL 값을 **hashValue**라고 하자.

📏 **해시 값 길이**
hashValue 값으로 사용 가능 문자가 `0~9, a-Z` 까지 총 62개이고
우리는 3650억개의 레코드를 보관할 수 있어야 하기 때문에 몇 자리의 문자가 필요한지 계산을 해본다면 다음과 같다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fb244617c-312f-4d3d-8c76-46a33320c1e1%2Fimage.png?table=block&id=314d67b9-9e80-8137-abff-e4338ce44a3a&cache=v2" alt="image" width="786" height="406" loading="lazy" />


62^n 이 3650억 개보다 커지는 n을 찾아야 한다. 
- n이 7이면 3.5조 개의 URL을 만들 수 있다.
- 따라서 해시 값의 길이는 7로 한다.

💥 **해시 후 충돌 해소**
원래 URL을 7글자 문자열로 줄이는 해시 함수가 필요하다.
- 쉬운 방법은 **CRC32, MD5, SHA-1** 같이 잘 알려진 해시 함수를 이용하는 것


| 해시 함수 | 해시 결과 (16진수) |
| ---- | ---- |
| CRC32 | 5cb54054 |
| MD5 | 5a62509a84df9ee03fe1230b9dfb84e |
| SHA-1 | 0eeae7916c06853901d9ccvefvfcaf4de57ed85b |


가장 짧은 해시 값인 CRC32가 계산한 것의 길이도 7보다 길다.
이를 어떻게 하면 줄일 수 있을까?

💡 **계산된 해시 값에서 처음 7개 글자만 이용하기**
- 해시 결과가 서로 충돌할 확률이 높아진다.
- 실제로 충돌이 일어났을 경우 충돌이 해소될 때까지 사전에 정한 문자열을 해시값에 덧붙인다.
- 충돌을 해소할 수는 있지만 단축 URL을 생성할 때 한 번 이상 DB 질의를 해야해 오버헤드 가 크다.
- DB 대신 블룸 필터를 사용하면 성능을 높일 수 있다.

💡 **base-62 변환**
수의 표현 방식이 다른 두 시스템이 같은 수를 공유해야 하는 경우에 유용

62진법을 사용하는 이유는 hashValue에 사용할 수 있는 문자 개수가 62개이기 때문
`11157`을 62진수로 변환
- `0은 0`으로 `9는 9`로, `10은 a` , `61은 Z`로 표현
- 11157 (10)  = 2TX (62)

따라서 단축 URL은 `https://tinyurl.com/2TX`가 된다.

🆚 **두 접근법 비교**

| 해시 후 충돌 해소 전략 | base-62 변환 |
| ---- | ---- |
| 단축 URL의 길이가 고정 | 단축 URL의 길이가 가변적, ID 값이 커지면 같이 커짐 |
| 유일성이 보장되는 ID 생성기가 필요하지 않음 | 유일성 보장 ID 생성기가 필요 |
| 충돌이 가능 - 해소 전략 필요 | ID 유일성이 보장되고 난 후 적용하기 때문에 충돌 불가능 |
| ID로 부터 단축 URL을 계산하는 방식이 아니라 다음에 사용할 수 있는 URL을 알아내는 것이 불가능 | ID가 1씩 증가하는 값이라고 가정하면 다음에 사용할 수 있는 단축 URL이 무엇인지 쉽게 알 수 있어 보안상 문제가 될 수 있음. |


### URL 단축키 상세 설계
URL 단축키는 시스템의 핵심 컴포넌트로 처리 흐름이 논리적으로는 단순해야 하고 기능적으로는 언제나 동작하는 상태로 유지되어야 한다.
- 62진법 (base-62) 변환 기법을 사용해 설계
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fd2d4efbb-e18e-46d3-b61f-96f5a09d6a3f%2Fimage.png?table=block&id=314d67b9-9e80-814f-8ceb-f28df62187d8&cache=v2" alt="image" width="958" height="738" loading="lazy" />


**🏃 과정**
1. 입력으로 긴 URL을 받는다.
2. 데이터베이스에 해당 URL이 있는지 검사
3. 있다면 해당 URL에 대한 단축 URL을 만든적이 있다는 것으로 해당 단축 URL을 가져와 반환
4. 없다면 유일한 ID를 생성한 후 데이터베이스의 기본키로 사용
5. 62진법 변환을 적용하여 ID를 단축 URL으로 만든다.
6. ID, 단축 URL, 원래 URL로 새 데이터베이스 record를 만든 후 단축 URL을 클라이언트에 전달한다.

### URL 리다이렉션 상세 설계
쓰기보다 읽기를 자주하는 시스템이기 때문에 캐시에 저장하여 성능을 높인다.
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F29dfa929-632c-4f27-88e8-aeaeabeecaf7%2Fimage.png?table=block&id=314d67b9-9e80-81b9-905e-e7caea7daf61&cache=v2" alt="image" width="908" height="480" loading="lazy" />

🔀 **로드밸런서 동작 흐름**
1. 사용자가 단축 URL을 클릭
2. 로드밸런서가 해당 클릭으로 발생한 요청을 웹 서버에 전달
3. 캐시에 해당 단축 URL이 없는 경우 데이터베이스에서 꺼낸다.
  - 데이터베이스에도 없다면 사용자가 잘못된 단축 URL을 입력한 경우이다.
1. 데이터베이스에서 꺼낸 URL을 캐시에 넣은 후 사용자에게 반환
# 📚 Ref.
<span class="inline-link" data-url="https://product.kyobobook.co.kr/detail/S000001033116" data-domain="product.kyobobook.co.kr"></span>
<span class="inline-link" data-url="https://vivoldi.com/blog/url-shortener/why-use-long-links-to-be-shortened" data-domain="vivoldi.com"></span>
<span class="inline-link" data-url="https://vivoldi.com/blog/url-shortener/track-realtime-clicks" data-domain="vivoldi.com"></span>
<span class="inline-link" data-url="https://www.reddit.com/r/aws/comments/133gtno/what_database_to_use_for_url_shortener_project/" data-domain="reddit.com"></span>
