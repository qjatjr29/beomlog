---
id: "341d67b9-9e80-801b-b0c3-f96f644d4c8e"
title: "Disk Management & Scheduling"
slug: "disk-management-scheduling"
category: "개발"
tags: ["디스크"]
date: "2026-04-13"
createdAt: "2026-04-13T02:47:00.000Z"
excerpt: "🔨 Disk 구조 단위 물리적 단위(Sector): 디스크 내부에서 데이터를 관리하는 최소 단위 논리적 단위(Logical Block): 디스크 외부(운영체제)에서 디스크에 접근..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fb3401320-b6a7-4c05-8b78-885cd81a8ab8%2Fimage.png?table=block&id=341d67b9-9e80-8080-986e-e91431e3d909&cache=v2"
groupId: "31ad67b9-9e80-80cd-9caa-e044bb4fba6f"
groupSlug: "운영체제"
lastEdited: "2026-04-13T02:47:00.000Z"
---

## 🔨 Disk 구조
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fb3401320-b6a7-4c05-8b78-885cd81a8ab8%2Fimage.png?table=block&id=341d67b9-9e80-8080-986e-e91431e3d909&cache=v2" alt="image" width="1334" height="1086" loading="lazy" />


### **단위**
<span class="text-red">**물리적 단위(Sector)**</span>**: 디스크 내부에서 데이터를 관리하는 최소 단위**
<span class="text-blue">**논리적 단위(Logical Block)**</span>: 디스크 외부(운영체제)에서 디스크에 접근할 때 사용하는 최소 단위

### 디스크 구성 요소

| 구성요소 | 설명 |
| ---- | ---- |
| **플래터 (platter)** | 실제로 데이터를 저장하는 **원형 디스크 판**. 하드디스크 내부에 여러 장이 쌓여 있고 양면 모두 데이터를 저장할 수 있습니다. |
| **트랙 (track)** | 플래터 위를 동심원 형태로 나눈 **원형 경로로** 데이터를 저장하기 위해 만들어진 원형 레일 |
| **섹터 (sector)** | 트랙을 쪼갠 **가장 작은 물리적 저장 단위**입니다. 보통 512바이트 또는 4KB 크기를 가집니다. |
| **실린더 (cylinder)** | 여러 플래터에서 **같은 반지름 위치의 트랙들을 묶은 것**입니다. 디스크 헤드가 한 번에 접근 가능한 트랙들의 집합입니다. |

## 📀 디스크 관리
### 디스크 포매팅 과정
**물리적 포매팅(low-level formatting)**
- 디스크 컨트롤러가 읽고 쓸 수 있도록 물리적인 공간을 섹터들로 나누는 과정
- 각 섹터는 헤더, 실제 데이터, 트레일러로 구성됩니다.

**파티셔닝 (Partitioning)**
- 하나의 물리적 디스크를 여러 개의 실린더 그룹으로 나누어 독립적인 디스크(ex: C 드라이브, D 드라이브 등)로 만드는 과정입니다.

**논리적 포매팅**
- 운영체제가 사용할 수 있도록 논리적 디스크에 **파일시스템**(FAT, inode 등)을 설치하는 과정입니다.

### 운영체제 부팅 과정
CPU는 하드웨어에 직접 접근할 수 없고 오직 메모리(RAM, ROM)에만 접근 가능합니다. 
전원이 켜지면 비휘발성 메모리인 ROM에 있는 작은 부트스트랩 로더가 실행됩니다. 
이 로더가 디스크의 `0번 섹터(Boot block)`를 메모리로 불러와 실행하고 최종적으로 운영체제가 메모리에 적재되어 부팅이 완료됩니다.

> 📦 **ROM**
> - 메모리 영역 중에 전원이 나가더라도 내용이 유지가 되는 소량의 메모리 공간


## 디스크 스케줄링
디스크에 접근하는 <u>Access Time</u>은 크게 3가지로 구성

| **구성** | **설명** |
| ---- | ---- |
| **Seek time** | 헤드를 목표 실린더로 움직이는데 걸리는 시간 |
| **Rotational latency** | 헤드가 도착한 후 원하는 섹터에 도달하기 까지 걸리는 회전지연시간 |
| **Transfer time** | 실제 데이터의 전송 시간 |

`Seek time` 은 디스크를 접근하는 시간중 가장 많은 부분을 차지합니다.
- 기계장치가 이동을 해야하기 때문에 시간이 오래 걸림

🎯 **Disk Scheduling의 목표 : ****`Seek time`****을 최소화하는 것**

### Disk Scheduling Algorithm
1️⃣ **FCFS (First Come First Service)**
요청이 들어온 순서대로 처리하는 단순한 방법이지만 순서가 안쪽 트랙, 바깥쪽 트랙이 번갈아 요청이 오게 되면 **디스크 헤더가 굉장히 많이 움직**여야 해 비효율적입니다.

2️⃣ **SSTF (Shortest Seek Time First)**
현재 헤드위치에서 가장 가까운 위치의 요청을 처리하는 방식으로 멀리 있는 요청이 계속 처리되지 않는 `기아(Starvation)` 현상이 발생할 수 있습니다.

3️⃣ **SCAN**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fb585ea27-4da7-4ab6-aecc-a7716bd58be5%2Fimage.png?table=block&id=341d67b9-9e80-80d3-b51e-d84a5d7b523f&cache=v2" alt="image" width="488" height="478" loading="lazy" />

헤드가 디스크의 한쪽 끝에서 반대쪽 끝으로 이동하며 경로에 있는 모든 요청을 처리하는 방식입니다.
- 한쪽 끝에 도달하면 역방향으로 모든 요청을 처리하면서 반대 끝으로 이동
- 엘리베이터 스케줄링이라고도 한다. (방식이 비슷)
**기아 현상이 발생하지 않고 헤드 이동 거리도 비교적 짧아 효율적입니다.**

하지만 실린더 위치에 따라 대기 시간이 매우 불균일해진다는 단점이 존재합니다. 
- ex) 헤드가 막 지나쳐 간 가장자리 트랙은 헤드가 반대편 끝까지 갔다가 돌아올 때까지 가장 오래 기다려야 합니다.

4️⃣ **C-SCAN**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F4e8107f8-e3aa-4c6f-a647-e819ab388c70%2Fimage.png?table=block&id=341d67b9-9e80-8033-a294-c1aa3ab00349&cache=v2" alt="image" width="452" height="398" loading="lazy" />

`SCAN` 알고리즘이 가진 위치별 대기 시간의 불균일성을 해결하기 위해 등장한 방식입니다
헤드가 한쪽 방향으로 이동하면서 요청을 처리하는 것은 SCAN과 동일하지만 한쪽 끝에 도달하면 역방향으로 처리하며 돌아오는 대신 아무 작업도 하지 않고 출발점으로 빠르게 이동합니다.
`SCAN`보다 균일한 대기 시간을 제공해줍니다.

5️⃣ **LOOK / C-LOOK**
`SCAN`과 `C-SCAN`은 요청의 유무와 상관없이 항상 디스크의 물리적인 끝(0번 트랙이나 마지막 트랙)까지 이동합니다. 
이를 최적화한 것이 `Look`방식입니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F8447c1b0-bcc2-48d8-b9f3-0e3225d79899%2Fimage.png?table=block&id=341d67b9-9e80-8024-8a7c-f2d017bf4e35&cache=v2" alt="image" width="494" height="406" loading="lazy" />

**LOOK** 알고리즘은 `SCAN`처럼 양방향으로 이동하지만 진행 방향에 더 이상 처리할 요청이 없다면 물리적 끝까지 가지 않고 즉시 방향을 바꿉니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F85f355a3-f1d2-49ee-9388-610a82bf85ac%2Fimage.png?table=block&id=341d67b9-9e80-80dc-a1a8-ced9c1a0e820&cache=v2" alt="image" width="502" height="372" loading="lazy" />


**C-LOOK **알고리즘은 `C-SCAN`처럼 한 방향으로 가다가 더 이상 요청이 없으면 바로 시작점으로 돌아갑니다. 
- 0번 트랙이 아닌 대기 큐에서 가장 주소가 작은 요청 위치로 이동합니다.

## 스왑 공간 관리
👀 **Disk를 사용하는 두 가지 이유**
- 메모리의 <u>**휘발성**</u> 특징(volatile) → file system 처럼 영속적으로 데이터를 유지해야 하는 경우 메모리에 저장하면 안됌
- 프로그램 실행을 위한 메모리 공간 부족 → **swap space (swap area)**

물리적인 디스크를 파티셔닝을 통해 논리적인 디스크를 만들 수 있고 각각의 논리적인 디스크는 운영체제가 독립적인 디스크로 간주하게 됩니다.
- 이 각각의 디스크에 파일시스템을 설치하여 사용할 수도 있고 swap area로 사용할 수도 있습니다.
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F2c3ebfa8-91de-4e68-9779-3ce3aa43abc9%2Fimage.png?table=block&id=341d67b9-9e80-8048-b9b2-e357280a2406&cache=v2" alt="image" width="1804" height="638" loading="lazy" />

**스왑 공간**에서는 공간 효율성보다는 <u>**속도 효율성**</u>이 우선입니다. 
일반 파일 시스템은 공간을 효율적으로 사용하기 위해 데이터를 작은 단위로 쪼개고 복잡한 메타데이터(디렉터리 구조, 파일 이름 등)를 관리합니다. 
하지만 스왑 공간은 당장 CPU가 실행해야 할 프로세스의 메모리 조각(Page)을 임시로 보관하는 곳입니다. 
필요한 데이터가 메모리에 없어 스왑 영역에서 가져와야 하는 상황(Page Fault)이 발생하면 RAM보다 수만 배 느린 디스크의 물리적 한계 때문에 시스템 전체의 성능이 크게 저하됩니다.
이런 지연 시간을 최소화하기 위해서 스왑영역은 데이터를 한 번에 크고 빠르게 읽고 쓰기 위해 파일 시스템보다 **훨씬 더 큰 블록 크기를 할당하여 디스크 헤드의 탐색 시간을 줄이는 방식을 사용합니다.**
## RAID (Redundant Array of Independent Disks)
여러 개의 저렴하고 작은 물리적 디스크를 묶어서 하나의 큰 논리적 디스크처럼 사용하는 기술
### 🎯 목적
**1️⃣ 디스크 처리 속도 향상**
- 여러 디스크에 block의 내용을** 분산 저장**
- 이렇게 데이터를 여러 디스크에 나눈 뒤 병렬적으로 동시에 읽고 씁니다.

**2️⃣ 신뢰성 향상**
- 동일 정보를 여러 디스크에 **중복 저장**
- 하나의 디스크가 고장시 다른 디스크에서 읽어옴(복구)

## 📚 Ref.
<span class="inline-link" data-url="http://www.kocw.net/home/search/kemView.do?kemId=1046323" data-domain="kocw.net"></span>

