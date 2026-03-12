---
id: "321d67b9-9e80-808f-bf2d-ddc2599f968b"
title: "데드락 (Deadlock, 교착상태)"
slug: "데드락-deadlock-교착상태"
category: "개발"
tags: ["데드락"]
date: "2026-03-12"
createdAt: "2026-03-12T06:42:00.000Z"
excerpt: "☠️ 데드락(Deadlock, 교착 상태)이란? 데드락은 2개 이상의 프로세스나 스레드가 서로 다른 프로세스가 점유하고 있는 자원을 얻기 위해 영원히 무한 대기하는 상태를 말합니다..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F2f2fa15d-cdd0-4abf-a2b3-c20236ab910d%2Fimage.png?table=block&id=321d67b9-9e80-800f-a6d0-cb092d96a084&cache=v2"
groupId: "31ad67b9-9e80-80cd-9caa-e044bb4fba6f"
groupSlug: "운영체제"
lastEdited: "2026-03-12T07:09:00.000Z"
---

## ☠️ **데드락(Deadlock, 교착 상태)이란?**
데드락은 2개 이상의 프로세스나 스레드가 서로 다른 프로세스가 점유하고 있는 자원을 얻기 위해 영원히 무한 대기하는 상태를 말합니다. 
즉, 각자가 필요한 자원을 남이 가지고 있어서 서로 양보하지 못하고 시스템이 마비되는 현상입니다.
> 📖 **자원**
> - 하드웨어, 소프트웨어 등을 포함하는 개념
> - ex) I/O Devices, CPU cycle, shared memory

## ✅ **데드락 발생의 4가지 필요조건**
데드락은 다음 4가지 조건이 **모두** 충족될 때만 발생하게 됩니다.

| **조건** | **설명** |
| ---- | ---- |
| **상호 배제 (Mutual Exclusion)** | 한 번에 하나의 프로세스만 자원을 사용할 수 있습니다. |
| **점유 대기 (Hold and Wait)** | 자원을 가진 프로세스가 보유한 자원을 놓지 않고 다른 프로세스가 점유한 자원을 얻기위해 대기합니다. |
| **비선점 (No Preemption)** | 다른 프로세스가 점유한 자원을 강제로 빼앗을 수 없습니다. |
| **순환 대기 (Circular Wait)** | 자원을 기다리는 프로세스들간 사이클이 형성되어 있어야 합니다. |

## 🔄 자원 할당 그래프 (Resource-Allocation Graph, RAG)
> **프로세스와 자원간**의 할당 및 요청 관계를 시각적으로 나타낸 방향 그래프

<figure>
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F2f2fa15d-cdd0-4abf-a2b3-c20236ab910d%2Fimage.png?table=block&id=321d67b9-9e80-800f-a6d0-cb092d96a084&cache=v2" alt="Single Instance Resource Type With DEADLOCK" width="956" height="520" loading="lazy" />
<figcaption>Single Instance Resource Type With DEADLOCK</figcaption>
</figure>

- **요청 간선 (Request Edge):** 프로세스 → 자원 (자원을 요청하고 대기 중)
- **할당 간선 (Assignment Edge):** 자원 → 프로세스 (자원이 프로세스에 할당됨)

<figure>
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F61b99675-5c10-490b-bc10-24eef9532caa%2Fimage.png?table=block&id=321d67b9-9e80-8038-a9f0-e8c28a55a8f7&cache=v2" alt="Multi Instaces With DEADLOCK" width="1126" height="510" loading="lazy" />
<figcaption>Multi Instaces With DEADLOCK</figcaption>
</figure>

✅  **데드락 판별 기준**
- **그래프에 사이클(Cycle)이 없다면:** 데드락이 절대 아닙니다.
- **그래프에 사이클(Cycle)이 있다면**
  - 자원 유형당 인스턴스가 **1개**뿐인 경우: 데드락 확정 ☠️
  - 자원 유형당 인스턴스가 **여러 개**인 경우: 데드락일 수도 있고 아닐 수도 있음
## 💡 **데드락 해결 방법**

| **해결 방식** | **동작 원리** |
| ---- | ---- |
| **예방 (Prevention)** | 자원 할당시 데드락의 4가지 필요 조건중 어느 하나가 만족되지 않도록 하는 방법 |
| **회피 (Avoidance)** | 자원 할당 시 데드락 발생 가능성을 계산하여 안전할 때만 자원을 줍니다 . **ex) 은행원 알고리즘** |
| **탐지 및 회복 (Detection & Recovery)** | 데드락 발생을 허용하지만 주기적으로 시스템을 검사하여 탐지되면 시스템을 회복시킵니다 . |
| **무시 (Ignorance)** | 데드락에 대해 아무런 조치도 취하지 않습니다. **ex) 타조 알고리즘(Ostrich Algorithm)** |

### 1️⃣ 예방 (Prevention)
1. **상호 배제 부정**
  - 여러 프로세스가 자원을 공유하도록 함. (사실상 프린터 같은 자원에서는 물리적으로 불가능)
2. **점유 대기 부정**
  - 방법 1: 프로세스 시작 시 필요한 모든 자원을 한 번에 할당. (자원 효율성 떨어짐)
  - 방법 2: 추가 자원을 요청할 때는 현재 가진 자원을 모두 반납한 후 요청. (기아 상태 우려)
3. **비선점 부정**
  - 다른 자원을 대기해야 할 경우 이미 점유한 자원을 빼앗기게(반납하게) 만듦. (CPU 레지스터처럼 상태 저장이 쉬운 자원만 가능)
4. **순환 대기 부정**
  - 모든 자원에 번호를 부여하고 **반드시 정해진 순서대로(ex: 1 → 3 → 5)으로만 자원을 요청**

> **⚠️ 한계**
> **데드락을 원천적으로 차단하지만 자원 이용률이 떨어지고 시스템 성능이 저하되며 기아(Starvation) 문제가 발생할 수 있어 비효율적입니다**

### 2️⃣ 회피 (**Avoidance)**
프로세스가 시작될 때 해당 프로세스가 사용할 자원의 최대량을 미리 알고 있다고 가정하고 데드락을 피해가는 방법
- **안전 상태 (Safe state):** 데드락을 발생시키지 않고 모든 프로세스가 정상 종료될 수 있는 상태
- **불안전 상태 (Unsafe state):** 안전 순서가 없어 데드락이 발생할 `가능성`이 있는 상태 
- 항상 `safe`한 상태를 유지

🤖 **자원 할당 그래프 알고리즘 (단일 인스턴스 환경)**
**📌 3가지 간선 상태**
1. **예약 간선 (Claim Edge, 점선)**
  - 프로세스가 나중에 이 자원을 요청할 수도 있다고 미리 선언해 둔 상태 (프로세스 → 자원)
2. **요청 간선 (Request Edge, 실선)**
  - 프로세스가 실제로 자원을 요청하고 대기하는 상태 
  - 예약 간선이 요청 간선으로 바뀝니다. (프로세스 → 자원)
3. **할당 간선 (Assignment Edge, 실선)**
  - 자원이 프로세스에게 최종적으로 할당된 상태. (자원 → 프로세스)
  - 사용이 끝나고 자원을 반납하면 다시 점선인 예약 간선으로 되돌아갑니다.

**⚙️ 동작 과정 및 자원할당 결정**
1. 프로세스가 자원을 요청하면 **점선(예약 간선)**이 **실선(요청 간선)**으로 바뀝니다.
2. 운영체제는 이 자원을 할당해 주었다고 **가정**하고 화살표 방향을 반대로 바꿉니다 (요청 간선 → 할당 간선).
3. **그래프 전체를 탐색하며 사이클(Cycle)이 생기는지 확인합니다.**
  - 🚨 **사이클 O (불안전 상태):** 점선(예약 간선)을 포함해서 원형 사이클이 만들어진다면 이는 미래에 데드락이 발생할 위험이 있다는 뜻입니다. 자원을 주지 않고 대기시킵니다.
  - ✅ **사이클 X (안전 상태):** 사이클이 없다면 데드락 위험이 없으므로 자원을 실제로 할당해 줍니다.

🤖 **은행원 알고리즘 (Banker's Algorithm, 다중 인스턴스 환경)**
> 은행(OS)이 고객(프로세스)에게 돈(자원)을 빌려줄 때 파산(데드락)하지 않고 모든 고객이 일을 마치고 돈을 갚을 수 있는 상태일 때만 빌려줌

- **Available (가용 자원):** 현재 시스템에 남아 있는 각 자원의 개수.
- **Max (최대 요구량):** 각 프로세스가 평생 동안 필요로 할 자원의 최대 개수.
- **Allocation (현재 할당량):** 현재 각 프로세스가 실제로 쥐고 있는 자원의 개수.
- **Need (추가 요구량):** 각 프로세스가 앞으로 작업을 마치기 위해 더 필요한 자원의 개수.

자원을 줬다고 가정한 상태에서 **"모든 프로세스가 무사히 작업을 마치고 자원을 반납할 수 있는 방법이 존재하는지"** 확인해봅니다.
- ✅ **안전 상태:** 남은 자원들을 통해서 모든 프로세스를 끝낼 수 있으면 할당.
- 🚨 **불안전 상태:** 누군가는 자원 부족으로 영원히 대기해야 한다면 (데드락 위험 발생) 대기.

### 3️⃣ 탐지 및 회복 **(Detection & Recovery)**
데드락은 자주 발생하지 않기 때문에 데드락이 생기도록 냅두고 탐지를 통해서 회복(해결)하는 방법
👀 **탐지 (Detection)**
- 단일 인스턴스에서는 대기 그래프(Wait-for graph)를 그려 사이클을 찾고 다중 인스턴스에서는 은행원 알고리즘과 유사한 탐지 알고리즘을 수행합니다.
❤️‍🩹 **회복 (Recovery) - 프로세스 종료 (Process Termination)**
1. 데드락에 연관된 모든 프로세스를 한 번에 죽임.
2. 데드락이 풀릴 때까지 프로세스를 하나씩 죽여봄.
❤️‍🩹 **회복 (Recovery) - 자원 선점 (Resource Preemption)**
- 희생자(Victim)를 선정해 자원을 빼앗아 다른 프로세스에게 줍니다. 
- 이때 뺏긴 프로세스는 안전한 상태로 롤백(Rollback)시켜야 합니다. (⚠️ 계속 같은 프로세스만 희생자로 뽑히면 **기아 상태** 발생 가능)
### 4️⃣ 무시 (Ignorance)
데드락이 일어나든 말든 OS가 아무런 조치를 취하지 않는 **타조 알고리즘 (Ostrich Algorithm)** 입니다.
데드락은 현실에서 매우 드물게 발생하는데 이를 막기 위해 예방, 회피(은행원 알고리즘 등), 탐지에 드는 성능 저하와 오버헤드 비용이 가끔 멈춘 프로그램을 사용자가 직접 강제 종료하는 불편함보다 훨씬 크기 때문입니다.
- **대부분의 현대 OS(Windows, Linux, macOS)가 이 방식을 채택**

## 📚 Ref.
<span class="inline-link" data-url="http://www.kocw.net/home/search/kemView.do?kemId=1046323" data-domain="kocw.net"></span>
<span class="inline-link" data-url="https://www.geeksforgeeks.org/operating-systems/resource-allocation-graph-rag-in-operating-system/" data-domain="geeksforgeeks.org"></span>
