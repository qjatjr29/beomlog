---
id: "31ad67b9-9e80-80fa-85ae-e670e1c3fd73"
title: "인터럽트 (Interrupt)"
slug: "인터럽트-interrupt"
category: "개발"
tags: ["인터럽트"]
date: "2026-03-05"
createdAt: "2026-03-05T03:47:00.000Z"
excerpt: "🤚 인터럽트 등장 배경 폴링 방식 초기 컴퓨터 시스템에는 주변 장치(ex: I/O 장치)가 많지 않아 CPU에서 직접 입출력 장치에 데이터를 가져오거나 내보냈다. CPU가 입출력..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fdaeb04b9-5cdc-4f8d-9d3d-fd32e827ea34%2Fimage.png?table=block&id=31ad67b9-9e80-80d3-b6ec-c800f525b63b&cache=v2"
groupId: "31ad67b9-9e80-80cd-9caa-e044bb4fba6f"
groupSlug: "운영체제"
lastEdited: "2026-03-05T07:10:00.000Z"
---

### 🤚 인터럽트 등장 배경
<span class="text-blue">**폴링 방식**</span>
초기 컴퓨터 시스템에는 주변 장치(ex: I/O 장치)가 많지 않아 CPU에서 직접 입출력 장치에 데이터를 가져오거나 내보냈다.
- CPU가 입출력장치의 상태를 주기적으로 검사하여 데이터를 처리

요즘 컴퓨터에는 많은 주변장치가 있기 때문에 폴링 방식으로 처리를 하다보면 작업 효율이 매우 떨어진다.

이런 문제를 해결하기 위해서 <span class="text-red">**인터럽트**</span> 방식이 등장하게 되었다.

## ✅ 인터럽트
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fdaeb04b9-5cdc-4f8d-9d3d-fd32e827ea34%2Fimage.png?table=block&id=31ad67b9-9e80-80d3-b6ec-c800f525b63b&cache=v2" alt="image" width="1088" height="746" loading="lazy" />

인터럽트 방식을 구현하기 위해서는 기존 CPU가 했던 일을 주변 장치별로 붙어 있는 `디바이스 컨트롤러`가 담당한다.

### 📖 **디바이스 컨트롤러**
> 해당 I/O 장치를 관리하는 일종의 작은 CPU


내부에 임시 데이터 저장을 위한 `로컬 버퍼`와 `제어 레지스터`를 가진다.
- I/O 요청으로 디스크에 데이터를 쓰거나 디스크로부터 데이터를 읽어오는 기계적 / 물리적 일을 처리
- I/O 작업이 완료되면 인터럽트를 통해 CPU에게 작업 완료 사실을 알려준다.

CPU는 디바이스 컨트롤러에게 <u>여러 개의 입출력 작업을 동시</u>에 시킬 수 있는데 이런 경우 여러 작업이 동시에 완료되고 그때마다 인터럽트를 여러 번 사용하는 것은 매우 비효율적이다.
따라서 여러 개의 인터럽트를 하나의 배열로 만든<span class="text-blue">** 인터럽트 벡터**</span>를 사용한다.
- CPU가 인터럽트 벡터를 받으면 인터럽트 번호에 해당하는 작업을 동시에 처리한다.

이를 통해 CPU는 I/O 명령을 입출력 관리자인 디바이스 컨트롤러에게 보내고 CPU는 프로세스 스케줄링으로 인해 선택된 다른 프로세스를 처리하게 된다.

### 🤖 인터럽트 종류
인터럽트는 크게 2가지 종류가 있다.

1️⃣ <span class="text-red">**소프트웨어 인터럽트 (trap)**</span>
- `Exception`: 프로그램이 오류 발생
- `System Call`: 프로그램이 커널 함수를 호출

2️⃣ <span class="text-blue">**하드웨어 인터럽트 (타이머, I/O 디바이스 등)**</span>

### 🏃 인터럽트 동작 과정
1. CPU가 I/O 명령 전달 (CPU → 디바이스 컨트롤러)
2. 디바이스 컨트롤러가 장치 제어
  - 실제 장치를 제어 (ex: 디스크 헤드 이동 후 데이터 읽기)
3. 데이터 로컬 버퍼 저장
4. 작업 완료 후 인터럽트 발생 (디바이스 컨트롤러 → CPU Interrupt)
5. CPU가 인터럽트 처리
  - 현재 작업을 멈추고 Interrupt Handler 실행
