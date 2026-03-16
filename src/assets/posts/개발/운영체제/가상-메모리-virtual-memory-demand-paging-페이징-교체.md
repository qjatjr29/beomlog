---
id: "325d67b9-9e80-804d-9e41-d71e3f0108a6"
title: "가상 메모리(Virtual Memory) - Demand Paging, 페이징 교체"
slug: "가상-메모리-virtual-memory-demand-paging-페이징-교체"
category: "개발"
tags: ["메모리관리","페이징"]
date: "2026-03-16"
createdAt: "2026-03-16T05:22:00.000Z"
excerpt: "✅ Demand Paging 프로그램 실행 시 모든 페이지를 메모리에 올리지 않고 실제 접근이 발생한 시점에만 해당 페이지를 메모리에 올리는 것 I/O 양 감소 Memory 사용량..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F638a6fb2-d4c8-4979-bf2b-ef4f5c9f7b48%2Fimage.png?table=block&id=325d67b9-9e80-8072-aa53-c9e3d5f9dfd3&cache=v2"
groupId: "31ad67b9-9e80-80cd-9caa-e044bb4fba6f"
groupSlug: "운영체제"
lastEdited: "2026-03-16T05:23:00.000Z"
---

## ✅ Demand Paging
프로그램 실행 시 모든 페이지를 메모리에 올리지 않고 실제 접근이 발생한 시점에만 해당 페이지를 메모리에 올리는 것
- I/O 양 감소
- Memory 사용량 감소
- 빠른 응답 시간
### 페이지 폴트
CPU가 참조한 페이지를 주소변환할 때 invalid bit이 set이 되어 있다면 `page fault`
- 해당 페이지가 메모리에 없다는 의미

💣 **page fault trap**
페이지 폴트가 발생하면 CPU는 운영체제에게 넘어가게 됩니다.
**페이지 폴트 처리 과정**
1. CPU가 예외를 발생시키고 커널 모드로 전환
2. 운영체제는 해당 접근이 유효한 주소 접근인지 검사
3. 유효한 접근이라면 해당 페이지가 디스크 어디에 있는지 확인.
4. RAM에 빈 프레임이 있으면 그곳에 적재
5. **빈 프레임이 없으면 기존 페이지 하나를 골라 내보냅니다.**
6. 필요한 페이지를 디스크에서 읽어옵니다.
7. 페이지 테이블을 갱신하고 valid bit를 켭니다.
8. 중단되었던 명령어를 다시 실행합니다.
## 🔁 페이지 교체
페이지 폴트가 발생했는데 **물리 메모리(RAM)에 빈 프레임이 없다면** 기존 페이지 중 <u>하나를 쫓아내고(Swap-out) 새로운 페이지를 올려놓는(Swap-in) 작업</u>이 필요합니다.
### 🧑‍💻 교체 알고리즘
> 🎯** 교체 알고리즘의 목표**
> **Page Fault Rate(페이지 폴트 발생률)을 최소화**


<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F638a6fb2-d4c8-4979-bf2b-ef4f5c9f7b48%2Fimage.png?table=block&id=325d67b9-9e80-8072-aa53-c9e3d5f9dfd3&cache=v2" alt="image" width="1272" height="902" loading="lazy" />

**🏄‍♂️ 동작과정**
1. 쫓아낼 희생양이 결정되면 해당 프레임의 `Dirty Bit(변경 비트, Modified Bit)`를 확인하여 변경된 내용이 있다면 <u>Backing Store(디스크)</u>에 저장
2. 변경된 적이 없다면 디스크 쓰기 작업을 생략하고 그냥 지워버립니다 (오버헤드 감소).
3. 쫓겨난 페이지의 페이지 테이블 엔트리를 `invalid`로 수정
4. 새로 필요한 페이지를 디스크에서 읽어와 메모리의 빈 프레임에 적재
5. 페이지 테이블 엔트리에 새로운 프레임 번호를 적고 `valid` bit를 설정
### Optimal Algorithm (OPT)
> 💡 **가장 먼 미래에 참조되는 페이지를 교체(앞으로 가장 나중에 참조될 페이지를 교체)**

미래를 다 안다고 가정하기 때문에 실제 사용을 하지 못합니다.
하지만 실제로 사용을 할 다른 알고리즘의 성능에 대한 `upper bound`를 제공하게 됩니다.
- 아무리 좋은 알고리즘이더라도 `OPT` 알고리즘보다 좋을순 없다!!
### FIFO (First In First Out) Algorithm
> ⬅️ **메모리에 먼저 들어온 페이지를 먼저 교체**
> - 구현이 매우 단순하고 운영 비용이 낮습니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F788f8de5-8c78-48e4-ba16-d769b3e515ff%2Fimage.png?table=block&id=325d67b9-9e80-8053-800b-d3932180670b&cache=v2" alt="image" width="1486" height="882" loading="lazy" />

🧑‍💻 **자료구조 - Queue**
메모리에 페이지가 적재될 때마다 큐에 순서대로 넣습니다.
- 교체가 필요할 때는 큐의 맨 앞(가장 먼저 들어온 노드)을 빼내는 방식으로 구현이 매우 단순하고 운영 비용이 낮습니다.
🧩 **Belady’s Anomaly**
일반적으로 프레임 수가 늘어난다면 `page fault`가 줄어들 것이라 생각하지만 `FIFO`는 프레임이 더 많아졌는데도 `page fault`가 증가할 수 있습니다.
- FIFO가 지역성을 반영하지 못한다는 것을 보여줌
### ⭐ LRU (Least Recently Used) Algorithm
> 🚀 **가장 덜 최근에 사용된 페이지를 교체 (가장 오래 전에 참조된 것)**

“조금 전에 사용한 페이지는 다시 사용될 가능성이 높고 오랫동안 사용하지 않은 페이지는 앞으로도 바로 필요하지 않을 가능성이 높다”는 **과거의 사용 이력을 바탕으로 미래를 예측**하는 방식입니다
👍 최근성을 반영하기 때문에 **시간 지역성(Temporal Locality)** 원리를 잘 활용하여 높은 성능을 보여주며 많이 사용합니다.
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fb99db8bb-b22b-423d-87aa-6dee71345a18%2Fimage.png?table=block&id=325d67b9-9e80-8001-8574-f938c1f1698b&cache=v2" alt="image" width="1218" height="430" loading="lazy" />

🧑‍💻 **자료구조 - 연결리스트**
**LRU**을 구현할 때 보통 자료구조로 <span class="text-blue">**연결리스트**</span>를 사용합니다.
리스트의 `Head`를 가장 최근에 사용된 페이지로, `Tail`을 가장 오래전에 사용한 페이지로 구성
- 이미 가득찬 상태에서 새로운 페이지가 들어오면 `Tail`에 있는 노드를 떼고 새로운 노드를 `Head`에 추가
- 기존에 있던 페이지를 다시 사용하는 경우(Cache Hit) 노드를 중간에서 빼어 `Head` 로 이동
### LFU (Least Frequently Used) Algorithm
> 💡 **참조 횟수(reference count)가 가장 적은 페이지를 교체**

🧑‍💻 **자료구조 - Heap**
**LFU** 방식은 <u>참조 횟수가 가장 적은 것</u>을 찾는 것이 핵심입니다.
이를 위해서 <span class="text-blue">**최소 힙 자료구조**</span>를 사용해 Root 노드에 항상 <u>참조 횟수가 가장 적은 페이지</u>를 위치하게 합니다.
- 교체할 페이지를 찾을 때의 시간: `O(1)`
- 특정 페이지가 다시 참조되어 카운트가 증가하게 되면 힙의 트리를 재 정렬: `O(logN)` 
⚠️ **단점**
- 오래전에 많이 사용되었지만 지금은 더 이상 필요 없는 페이지가 높은 참조 횟수만 믿고 계속 남아 있을 수 있습니다. 
- 반대로 막 들어온 새 페이지는 아직 참조 횟수가 적어서 실제로는 곧 자주 쓰일 예정이어도 쉽게 희생될 수 있습니다.

### ☠️ **왜 OS의 페이징 시스템은 순수 LRU / LFU를 사용하지 못할까?**
`LRU`와 `LFU`는 **실제 운영체제의 가상 메모리 페이징 시스템에서는 이를 그대로 구현할 수 없습니다.**
그 이유는 운영체제가 <span class="text-blue">"페이지가 언제, 몇 번 참조되었는지 정확히 알 수 없기 때문"</span>입니다.

1️⃣ **Cache Hit 시 OS는 개입하지 않음**
CPU가 가상 주소를 요청했을 때 해당 페이지가 이미 물리 메모리에 있다면(`Cache Hit`) `MMU`가 주소 변환을 즉시 처리합니다. 
이때는 **인터럽트가 발생하지 않으므로 운영체제(OS)는 CPU를 넘겨받지 못합니다.**

2️⃣ **이력 추적 불가**
이렇게 OS가 개입하지 못하기 때문에 **이중 연결 리스트의 순서를 바꾸거나(LRU) 참조 카운트를 증가시켜 힙을 재정렬(LFU)하는 소프트웨어적인 작업을 수행할 수 없습니다. **
- 사용하지 못하는 이유

3️⃣ **OS가 개입하는 유일한 순간**
OS는 오직 데이터가 메모리에 없어서 **페이지 폴트(Page Fault)** 인터럽트가 발생했을 때만 변경할 페이지를 찾습니다.

이러한 하드웨어 구조적 한계 때문에 실제 운영체제는 순수 `LRU`나 `LFU` 대신 `MMU`가 지원하는 `Reference Bit(참조 비트)`를 활용하여 `LRU`와 비슷하게 동작하도록 흉내 내는 **Clock(클럭) 알고리즘** 같은 **근사(Approximation) 알고리즘**을 사용합니다.

### Clock Algorithm
> ⏲️ **LRU의 근사 알고리즘**
> - `Second chance algorithm`
> - `NUR (Not Used Recently)`, `NRU (Not Recently Used)`

🧩 **참조 비트(Reference Bit)와 순환 큐**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F44dd66ed-f0a5-4fac-b950-27fc8d05ef48%2Fimage.png?table=block&id=325d67b9-9e80-80f5-babb-d2439cd9777a&cache=v2" alt="image" width="1700" height="768" loading="lazy" />


클럭 알고리즘은 메모리에 올라와 있는 페이지 프레임들을 **순환 큐(원형 리스트)** 형태로 관리하며 시계바늘(포인터)이 돌아가며 교체 대상을 찾습니다.
이때 하드웨어(MMU)가 각 프레임마다 **참조 비트(Reference Bit)**를 제공합니다.
- CPU가 어떤 페이지에 접근(읽기/실행)하면 MMU는 하드웨어적으로 해당 페이지의 참조 비트를 `1`로 세팅합니다. (<span class="text-red">OS 개입 없음</span>)
이후, 페이지 폴트가 발생해 쫓아낼 페이지를 찾아야 할 때만 OS가 시계바늘을 움직이며 참조 비트를 확인하게 됩니다.
- 참조 비트가 <span class="text-red">`1`</span>이라는 것은 최근에 참조가 되었다는 것을 의미

**🔄 페이지 교체과정**
1. OS가 시계바늘이 가리키는 현재 페이지의 참조 비트를 검사합니다.
2. **참조 비트가 ****`1`****인 경우:** ”최근에 사용된 적이 있구나!”라고 판단해 비트를 `0`으로 초기화하고 시계바늘을 다음 페이지로 이동시킵니다.
3. **참조 비트가 ****`0`****인 경우:** "한 바퀴 도는 동안(최근에) 한 번도 사용되지 않았구나!"라고 판단하여 해당 페이지를 교체합니다.
### Clock 알고리즘의 개선
기본 Clock 알고리즘은 오직 **Reference Bit(참조 비트)**만을 확인하여 최근에 참조(Read/Write 모두 포함)되었는지만을 고려했습니다. 하지만 페이지를 교체할 때 **Swap-out(디스크에 다시 쓰는 작업) 여부**도 전체 시스템 성능에 영향을 미칠 수 있습니다.
- 메모리에서 내용이 변경된 페이지는 쫓겨날 때 디스크에 그 변경 사항을 기록해야 하므로 I/O 오버헤드가 추가로 발생하기 때문

> **Reference Bit**뿐 아니라 **Modified Bit(변경 비트)**까지 함께 고려하는 방식을 사용합니다.

1️⃣ **Modified Bit가 0인 경우**
- 메모리에 올라온 이후 한 번도 Write가 발생하지 않은 상태입니다. 
- 따라서 이 페이지를 쫓아낼 때는 디스크에 변경된 내용을 기록할 필요 없이 그냥 덮어쓰고 버리면 됩니다 (I/O 비용 ❌).
2️⃣ **Modified Bit가 1인 경우**
- 메모리에 올라온 이후 적어도 한 번은 CPU에서 Write를 수행한 상태입니다. 
- 이 페이지를 쫓아내려면 Backing Store(디스크)에 수정된 값을 반영해 주어야 합니다 (I/O 비용 ⭕)
따라서 교체될 페이지를 선택할 때 `Modified Bit`가 1인 페이지보다는 0인 페이지를 우선적으로 내보내는 것이 성능상 유리합니다.

↗️ **교체 우선순위**

| 우선순위 | (Reference, Modified) | 설명 |
| ---- | ---- | ---- |
| **1순위** | **(0, 0)** | **최근에 쓰지도 않았고 변경되지도 않음** |
| **2순위** | **(0, 1)** | **최근에 쓰진 않았지만 변경은 됌** |
| **3순위** | **(1, 0)** | **최근에 썼지만 변경되진 않음** |
| **4순위** | **(1, 1)** | **최근에 썼고 변경도 됌** |

## 👾 Thrashing
### **🛑 프레임 할당 (Frame Allocation)**
여러 프로세스가 동시에 메모리에 올라와 실행되는 **다중 프로그래밍** 환경에서는 한정된 물리 메모리(프레임)를 어떻게 나눠줄 것인가가 중요합니다.
프로세스에 프레임을 너무 적게 주면 잦은 페이지 폴트가 발생하고 너무 많이 주면 메모리가 낭비되어 다른 프로그램을 실행할 수 없습니다.
따라서 각각의 프로세스에 어느정도의 메모리 페이지를 할당해주어야 합니다.

**[프레임 할당 방식 - Frame Scheme]**

| 할당 방식 | 설명 |
| ---- | ---- |
| **균등 할당 (Equal Allocation)** | 모든 프로세스에게 동일한 개수의 프레임을 똑같이 나눠줍니다 |
| **비례 할당 (Proportional Allocation)** | 프로세스의 크기에 비례하여 프레임을 나누어 줍니다 |
| **우선 할당 (Priority Allocation)** | 프로세스의 priority에 따라 다르게 할당 |

### **전역 교체 (Global Replacement) vs 지역 교체 (Local Replacement)**
**전역 교체:** 페이지 교체 시 **다른 프로세스에 할당된 프레임까지 빼앗아** 올 수 있습니다. 
- 메모리 효율이 좋아 시스템 처리량을 높일 수 있지만 특정 프로세스가 필요로 하는 페이지가 다른 프로세스에 의해 자주 교체될 수 있어 시스템 전체적인 스레싱(Thrashing)이 발생
- Process별 메모리 할당량을 자동으로 조절
- `Working Set`, `PFF` 알고리즘 사용
**지역 교체:** 자신에게 할당된 프레임 안에서만 교체합니다.
- FIFO, LRU, LFU 등의 알고리즘을 프로세스별로 운영
### 💣 Thrashing
스레싱은 프로그램이 원활한 수행에 필요한 **최소한의 프레임조차 할당받지 못해 페이지 폴트(Page Fault)가 비정상적으로 많이 발생하는 현상**입니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fe7ad0aec-417e-4d84-9e64-c40edd56fa60%2Fimage.png?table=block&id=325d67b9-9e80-80e6-aa99-f5f183b1f1f2&cache=v2" alt="image" width="940" height="546" loading="lazy" />

1. 일반적으로 메모리에 올라가는 프로그램의 수(Multiprogramming Degree)를 늘리면 CPU 이용률(Utilization)이 함께 올라갑니다.
2. 하지만 Degree를 계속 올리다 보면 각 프로세스에 할당되는 물리 프레임 수가 부족해집니다.
3. 이로 인해 모든 프로세스에서 페이지 폴트율이 급증하고 쫓겨난 페이지를 디스크에서 다시 가져오기 위해 막대한 I/O 작업이 발생합니다.
4. 이는 어떤 프로그램이 CPU를 잡더라도 당장 필요한 페이지가 없어 바로 I/O 대기 상태에 빠지게 되며 **결국 어느 순간부터 CPU 이용률이 바닥으로 뚝 떨어집니다.**

> **🚀 해결책**
> - CPU 이용률이 떨어졌다고 무작정 새로운 프로세스를 투입하면 스레싱이 더 심해집니다. 
> - 따라서 다중 프로그래밍 정도(Degree)를 조절하여 동시에 메모리에 올라가는 프로그램의 개수를 적절히 줄여주어야 합니다. 
> - 이를 위한 대표적인 동적 할당 알고리즘이 `Working-Set`과 `PFF`입니다.

### Working-Set Model
이 모델은 프로세스가 **특정 시간 동안 특정 메모리 영역만 집중적으로 참조**한다는 `참조의 지역성(Locality of Reference)`을 기반으로 합니다. 
- 집중적으로 참조되는 페이지들의 집합을 Locality Set이라고 합니다.
- 프로세스가 일정 시간 동안 원활하게 수행되기 위해 **반드시 한 번에 메모리에 올라와 있어야 하는 페이지들의 집합**을 `Working Set`이라 정의

🏃 **동작 원리**
- 현재 프레임이 충분하여 Working Set 전체를 메모리에 올릴 수 있을 때만 해당 프로세스를 실행(Swap-in)합니다.
- 만약 빈 프레임이 부족해서 Working Set을 보장해 줄 수 없다면 **해당 프로세스가 가진 모든 프레임을 강제로 반납시키고 통째로 Swap-out** 시킵니다.
- 이를 통해 시스템 전체의** Multiprogramming Degree**를 안전하게 조절하고 **스레싱을 차단**합니다
### PFF(Page-Fault Frequency) Scheme
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Ffe745919-aaaf-48cf-88fd-993ed9caf237%2Fimage.png?table=block&id=325d67b9-9e80-80dd-8ee4-eb047d39717d&cache=v2" alt="image" width="1022" height="508" loading="lazy" />

Working Set 방식이 페이지 참조 기록을 추적한다면 PFF는 <u>**"현재 페이지 폴트가 얼마나 자주 일어나는가?"**</u> 를 직접 살펴보고 프레임을 조절합니다.

🏄‍♂️ **동작 과정**
OS는 프로세스별로 페이지 폴트율의 **상한선(Upper Bound)**과 **하한선(Lower Bound)**을 정해둡니다.
- **상한선 초과:** 페이지 폴트가 너무 자주 일어난다는 것으로 프레임이 부족하다는 의미이기 때문에 **프레임을 더 할당**해 줍니다.
- **하한선 미만:** 페이지 폴트가 너무 안 일어난다는 것으로 프레임이 쓸데 없이 많이 할당되어 있는 상태기 때문에 **할당된 남는 프레임을 회수**합니다.
만약 상한선을 넘었는데 남은 빈 프레임이 없다면 프로세스 하나를 통째로 `Swap out` 시켜 메모리를 확보합니다.
## 📚 Ref.
<span class="inline-link" data-url="http://www.kocw.net/home/search/kemView.do?kemId=1046323" data-domain="kocw.net"></span>

