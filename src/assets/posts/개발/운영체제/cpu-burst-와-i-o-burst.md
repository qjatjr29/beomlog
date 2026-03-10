---
id: "31cd67b9-9e80-8034-900c-c79b58f0d7c1"
title: "CPU burst 와 I/O burst"
slug: "cpu-burst-와-i-o-burst"
category: "개발"
tags: ["CPU","I/O"]
date: "2026-03-07"
createdAt: "2026-03-07T05:20:00.000Z"
excerpt: "🖥️ 프로그램의 실행 프로그램이 실행된다는 것은 CPU를 사용하여 연산을 하는 단계(CPU Burst)와 파일 읽기/쓰기, 네트워크 통신과 같은 I/O 작업(I/O Burst)이..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F9d8339cc-1b97-4447-935c-85f70403211a%2Fimage.png?table=block&id=31cd67b9-9e80-80cf-b09b-db97657a615b&cache=v2"
groupId: "31ad67b9-9e80-80cd-9caa-e044bb4fba6f"
groupSlug: "운영체제"
lastEdited: "2026-03-07T05:21:00.000Z"
---

### 🖥️ 프로그램의 실행
프로그램이 실행된다는 것은 <span class="text-red">**CPU를 사용하여 연산을 하는 단계(CPU Burst)**</span>와 파일 읽기/쓰기, 네트워크 통신과 같은 <span class="text-red">**I/O 작업(I/O Burst)**</span>이 끊임없이 번갈아 일어나는 과정입니다.

## 💡** CPU Burst와 I/O Burst**
### 🔥 **CPU Burst**
> 프로세스가 실제로 **CPU를 점유하고 기계어 명령어들을 실행(연산)하는 시간**


🧩 **특징**
- CPU 속도에 영향을 받으며 연산 중심의 작업(복잡한 수학 계산, 이미지/동영상 렌더링 등)

### 💿** I/O Burst**
> 프로세스가 CPU를 반납하고 **입출력(I/O) 작업이 끝날 때까지 대기하는 시간**


🧩 **특징**
- 파일 읽기/쓰기, 네트워크 통신, 사용자 입력 대기 등이 포함
- 입출력 속도에 의해 전체 작업 시간이 지연

### 프로세스 생명주기 = CPU Burst 🔄 I/O Burst 의 연속
프로그램이 시작되면 CPU 연산을 하다 화면에 결과를 출력하거나 파일에서 다음 데이터를 읽어오기 위해 멈추게 됩니다. 이후 I/O 작업이 끝나면 다시 연산을 하는 과정등을 프로그램이 끝날때까지 반복합니다.
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F9d8339cc-1b97-4447-935c-85f70403211a%2Fimage.png?table=block&id=31cd67b9-9e80-80cf-b09b-db97657a615b&cache=v2" alt="image" width="628" height="760" loading="lazy" />

## 🤖 **CPU Bound vs I/O Bound**
프로그램들도 어떤 Burst가 더 긴지(무엇을 주로 하는지)에 따라 두 가지로 나뉩니다. 
- 운영체제는 이 것을 파악해야 스케줄링을 똑똑하게 할 수 있습니다.

| **구분** | **CPU Bound Process** | **I/O Bound Process** |
| ---- | ---- | ---- |
| **설명** | **CPU Burst**가 길고 많은 프로세스 (계산 위주) | **I/O Burst**가 길고 잦은 프로세스 |
| **예시** | 동영상 인코딩 / 렌더링 | **웹 서버 / DB 서버** (네트워크/디스크 작업 위주) |
| **CPU 사용 빈도** | 가끔 CPU를 잡지만, **길게** 씀 | 자주 CPU를 잡지만 **아주 짧게** 씀 |


### 🤔 ** 왜 이 두 가지를 구분하는 것이 중요할까요? (OS 스케줄러의 고민)**
바로 **CPU 스케줄링(누구에게 먼저 CPU를 줄 것인가)** 때문입니다.
> 💡 즉 운영체제가 **누구에게 먼저 CPU를 할당해줄 것인지?** 를 결정할 때 사용

만약 **CPU Bound 프로세스(동영상 인코딩 프로그램)**와 **I/O Bound 프로세스(워드 프로세서)**가 동시에 실행된다고 가정을 해본다면!

⚠️ **CPU Bound가 먼저 실행되는 경우**
- OS가 인코딩 프로그램에게 CPU를 줍니다. (긴 CPU Burst)
- 그동안 사용자는 워드 프로세서에 글씨를 쳐도 화면에 나타나질 않습니다 (I/O Bound가 CPU를 못 받아서 렉 걸림). 
- **→ 사용자 답답함**

👍 I**/O Bound 먼저)**
- OS가 워드 프로세서에게 CPU를 먼저 줍니다.
- 워드 프로세서는 글자 하나 찍어주고(짧은 CPU Burst) 다음 키보드 입력을 기다린다며 **스스로 CPU를 뱉어내고 대기(I/O Burst) 상태**로 들어갑니다.
- 워드 프로세서가 뱉어낸 그 빈 시간에 OS는 인코딩 프로그램에게 남는 CPU를 줍니다.
- **→ 화면 반응도 빠르고 뒷단에서 인코딩도 잘 돌아가게 된다!!!**

## 🚀** 결론**
프로그램 실행은 **CPU Burst와 I/O Burst가 반복되는 과정**입니다.
운영체제는 효율적인 CPU 사용과 빠른 사용자 응답을 위해
- **CPU Bound 프로세스**
- **I/O Bound 프로세스**
를 구분하여 스케줄링을 수행합니다.
- **사용자와 상호작용이 많은 I/O Bound 프로세스에 더 높은 우선순위를 주는 경향**이 있습니다.

## 📚 Ref.
<span class="inline-link" data-url="http://www.kocw.net/home/search/kemView.do?kemId=1046323" data-domain="kocw.net"></span>
