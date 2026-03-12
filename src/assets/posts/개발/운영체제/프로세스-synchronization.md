---
id: "321d67b9-9e80-80ad-a4c2-cc05d959f6c9"
title: "프로세스 Synchronization"
slug: "프로세스-synchronization"
category: "개발"
tags: ["동기화","프로세스","스레드","race condition"]
date: "2026-03-10"
createdAt: "2026-03-12T02:31:00.000Z"
excerpt: "실무에서 대규모 트래픽을 다룰 때 발생하는 데이터 정합성 이슈(예: 수강신청, 선착순 쿠폰 발급, 재고 차감 등)는 모두 프로세스 동기화(Process Synchronization..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F9c09b75b-9e05-4c3c-9a37-61a26a314c29%2Fimage.png?table=block&id=321d67b9-9e80-80da-a712-f9e77ddc7bbb&cache=v2"
groupId: "31ad67b9-9e80-80cd-9caa-e044bb4fba6f"
groupSlug: "운영체제"
lastEdited: "2026-03-12T06:42:00.000Z"
---

실무에서 대규모 트래픽을 다룰 때 발생하는 데이터 정합성 이슈(예: 수강신청, 선착순 쿠폰 발급, 재고 차감 등)는 모두 **프로세스 동기화(Process Synchronization)** 개념에서 발생하게 됩니다.
이번에는 프로세스 동기화 부분을 다시 학습하고 정리해보고자 합니다!!
## 🔍 경쟁상태 - Race Condition
경쟁 상태란 두 개 이상의 프로세스나 스레드가 공유 자원에 동시에 접근하여 조작할 때 **실행 순서(타이밍)에 따라 결과값이 달라지는 현상**을 말합니다.
- 여러 프로세스들이 동시에 공유 데이터에 접근하는 상황
- 데이터의 최종 연산 결과는 마지막에 그 데이터를 다룬 프로세스에 따라 달라짐.

> 💡 **race condition을 막기 위해서는 동시 접근하는 프로세스/스레드간 동기화가 필수**

### OS에서 race condition은 언제 발생할까?
운영체제 내부에서 커널 데이터를 다룰 때 크게 3가지 상황에서 경쟁 상태가 발생할 수 있습니다.
1️⃣ **Kernel 수행 중 인터럽트 발생 시**
커널이 특정 작업 (`ex: count++`)을 수행하는 도중에 인터럽트가 발생하여 인터럽트 처리 루틴(handler)로 제어권이 넘어 갈 때 발생.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F9c09b75b-9e05-4c3c-9a37-61a26a314c29%2Fimage.png?table=block&id=321d67b9-9e80-80da-a712-f9e77ddc7bbb&cache=v2" alt="image" width="872" height="464" loading="lazy" />


⚠️ **문제 상황**
- 커널이 `count` 값을 메모리에서 CPU 레지스터로 읽어옵니다(**Load**).
- 이때 인터럽트가 발생하여 현재 작업을 멈추고 인터럽트 핸들러가 실행됩니다.
- 인터럽트 핸들러도 동일한 `count` 변수를 조작(예: `count--`)하고 저장(**Store**)합니다.
- 인터럽트 처리가 끝나고 원래 커널 작업으로 돌아오면 커널은 아까 읽어둔 레지스터 값을 기준으로 1을 증가시켜 저장(**Store**)합니다.

✅ **결과**
인터럽트 핸들러가 처리한 `count--` 연산이 무시되고 덮어씌워지는 데이터 유실이 발생

💡 **해결방법 (Disable Interrupt)**
- 커널이 중요한 공유 변수(Critical Section)를 건드리는 동안에는 **인터럽트가 발생해도 바로 처리하지 않고 지연(Disable Interrupt)시킵니다**. 
- 해당 명령어를 모두 처리한 후 인터럽트를 활성화하여 넘기도록 제어

2️⃣ **시스템 콜(System Call) 중 프로세스 Context Switch 발생 시**
사용자 프로세스가 시스템 콜을 호출하여 커널 모드(Kernel Mode)로 진입해 커널 데이터를 수정하던 중 <u>CPU 할당 시간(Time Quantum)</u>이 만료되어 다른 프로세스로 `context switch`가 일어날 때 발생합니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fe70f50a7-3b04-4a68-8595-777e9f79f9a9%2Fimage.png?table=block&id=321d67b9-9e80-803e-a7d9-fb506fbf28af&cache=v2" alt="image" width="1092" height="386" loading="lazy" />



⚠️ **문제 상황**
- Process A가 시스템 콜을 통해 커널 모드에서 `count++`의 Load 연산까지만 수행한 상태에서 CPU 할당 시간이 끝납니다.
- 제어권이 Process B로 넘어가고 Process B 역시 시스템 콜을 통해 동일한 커널 데이터인 `count`를 1 증가시킵니다.
- 다시 Process A로 제어권이 돌아오면 A는 자신이 Load 했던 값을 기준으로 1을 증가시킵니다.

✅ **결과**
- 두 프로세스가 각각 1씩 증가시켰지만 결과적으로는 1만 증가하는 데이터 불일치가 발생합니다.

💡 **문제 해결 - Non-preemptive kernel**
- 프로세스가 **커널 모드에서 실행 중일 때는 **CPU 할당 시간이 끝나도 CPU를 강제로 빼앗지 않도록(Non-preemptive) 설계
- **사용자 모드(User Mode)**로 되돌아가는 시점에 CPU 제어권을 넘기도록 하여(Preempt), 커널 데이터 조작 중단으로 인한 문제를 방지

3️⃣ **멀티 프로세서(Multiprocessor)환경에서의 shared memory내 커널 데이터 접근**
여러 개의 **CPU(Core)**가 동시에 실행되는 환경에서는 위의 1번(인터럽트 제어)이나 2번(비선점) 방법만으로는 `Race Condition`을 막을 수 없습니다. 
- 작업 주체(CPU)가 아예 물리적으로 여러 개이기 때문

⚠️ **문제 상황**
- CPU 1과 CPU 2가 동시에 커널 내부의 공유 메모리 공간에 있는 데이터에 접근하여 조작할 때 발생

💡 **문제 해결(Locking)**
- 특정 CPU가 공유 데이터에 접근할 때 <span class="text-red">**락(Lock)**</span>을 걸어 다른 CPU의 접근을 막습니다.
- 한 번에 오직 하나의 CPU만 커널에 진입할 수 있도록 락을 겁니다. (성능 저하)
- 커널 내부에 있는 각 공유 데이터(변수 등)으로 접근할 때마다 개별적으로 Lock / Unlock을 수행
## ⚠️ Process Synchronization 문제
멀티 프로그래밍, 멀티 스레딩 환경에서는 프로세스나 스레드가 동시에 <span class="text-red">**공유 데이터(Shared Data)**</span>에 접근하는 일이 발생합니다.
이러한 <span class="text-blue">**동시 접근(Concurrent Access)**</span>은 데이터의 일관성을 훼손하는 **불일치(Inconsistency) 문제**. 즉 `경쟁 상태(Race Condition)`를 유발할 수 있습니다.
따라서 데이터의 일관성 유지를 위해 협력하는 프로세스 간의 실행 순서를 규칙적으로 정해주는 메커니즘을 <span class="text-red">**동기화(Synchronization)**</span>라고 합니다
### 🧑‍💻 **임계 영역 (Critical Section)**
위와 같이 **문제가 발생하는 코드의 구간(공유 데이터에 접근하는 부분, 코드)**을 **임계 영역**이라고 부릅니다. 
동기화의 핵심은 `임계 영역에는 한 번에 하나의 스레드만 들어가게 만들자`는 것입니다.
- 하나의 프로세스가 임계 영역에 있을 때 다른 모든 프로세스는 임계 영역에 들어갈 수 없어야 한다.
### ✅** 동기화가 성립하기 위한 3가지 조건**
임계 영역 문제를 해결하려면 다음 **세 가지 조건**을 반드시 만족해야 합니다.

| 조건 | 설명 | 방지하는 문제 |
| ---- | ---- | ---- |
| **상호 배제 (Mutual Exclusion)** | 어떤 프로세스가 임계 영역을 실행 중이라면 다른 어떤 프로세스도 임계 영역에 진입할 수 없어야 합니다. | **동시 접근 방지** (Race Condition 방지) |
| **진행 (Progress)** | 임계 영역이 비어있고 들어가고자 하는 프로세스들이 있다면 **이들 중 누가 들어갈지 적절히 선택해 주어야 하며 무한정 미뤄져서는 안 됩니다.** | **무한 대기 방지** (Deadlock 교착 상태 방지) |
| **한정된 대기 (Bounded Waiting)** | 프로세스가 임계 영역 진입을 요청한 후부터 허용될 때까지, **다른 프로세스들이 나를 새치기하여 임계 영역에 진입하는 '횟수'에 제한이 있어야 합니다.** | **기아 상태 방지** (Starvation 방지) |

## 🔍 동기화 문제 해결 방법
### 피터슨 알고리즘 
**두 개의 프로세스(또는 스레드)가 공유 메모리를 사용하여 상호 배제(Mutual Exclusion)를 구현하는 고전적인 소프트웨어 기반 해결책**입니다
가장 고전적인 **순수 소프트웨어 기반**의 동기화 해결책입니다. 
두 프로세스가 두 개의 공유 변수(`turn`, `flag`)를 이용해 임계 영역에 진입할 순서를 정합니다.
- 임계 영역 해결을 위한 3가지 조건을 처리


| **변수** | **설명** |
| ---- | ---- |
| **flag[2]** | 프로세스가 임계 영역에 들어가고 싶은지 의사를 표시하는 배열 |
| **turn** | 임계 구역에 들어갈 차례가 누구인지 나타냄 |

👀 **동작 방식**
- 자신의 flag를 true로 설정하고 다른 프로세스에게 양보(turn 변경)한 뒤 상대방이 flag를 false로 하거나 차례가 오면 진입하는 방식

⚠️ **한계**
- 2개의 프로세스만 지원하기 때문에 현재의 멀티 코어 환경에서는 제대로 동작하지 않을 수 있습니다.

### **스핀락 (Spinlock)**
> 임계 영역에 락이 걸려있다면 락이 풀릴 때까지 `while` 루프를 돌며 <u>락이 해제되었는지</u> 계속 확인하는 방식


**장점**
- 락을 획득하기 위한 context switch 가 발생하지 않습니다. 
- 따라서 임계 영역에서 수행하는 작업이 짧아서 context switch 에 걸리는 시간보다 락을 기다리는 시간이 더 짧다면 CPU를 좀 더 쓰면서 기다리는 스핀락이 더 빠르고 효율적일 수 있습니다.

⚠️** 단점: **<span class="text-red">**Busy Waiting**</span>** 문제가 발생**
- CPU 할당 시간동안 계속해서 락의 상태를 확인하며 낭비
- 락을 가진 프로세스/스레드가 임계 영역에 오래 있다면 성능이 저하

### **뮤텍스 (Mutex)**
뮤텍스는 화장실(공유 자원)을 이용하기 위해 **오직 1개의 'Key(열쇠) 🔑’** 를 바탕으로 상호 배제를 달성하는 동기화 기법입니다
- 화장실에 들어갈 때 Key를 가지고 들어가서 문을 잠그고(Lock) 볼일이 끝나면 나와서 문을 열고 Key를 반납(Unlock)해야 합니다.
- 락(Key)을 획득한 스레드만이 그 락을 해제할 수 있습니다.

락이 걸려져 있으면 계속 기다리지 않고 대기 큐(Queue)로 들어가서 잠(Sleep/Block)을 자는 방식으로 안에 있던 스레드가 락을 반환하면 대기 큐에 있던 프로세스를 깨워줍니다(Wakeup).

### **세마포어 (Semaphore)**
`앞의 방식들을 추상화`
세마포어는 화장실 칸이 여러 개일 때 빈자리가 있는지 알려주는 것 같은 **'신호(Signal) 🚦' 방식**의 동기화 기법입니다.
뮤텍스가 1개의 자원(Lock/Unlock)을 관리하는 반면 세마포어는 <span class="text-red">**정수형 변수(S)**</span>를 이용해 여러 개의 공유 자원을 관리할 수 있도록 **추상화**된 자료형입니다.
- 설정한 정수값에 따라 **1개 이상의 다수 자원**을 제어
- 뮤텍스와 달리 특정 스레드가 락을 소유하지 않습니다. A 스레드가 락을 걸었더라도(Wait) **전혀 다른 B 스레드가 신호(Signal)를 보내 락을 해제해 줄 수 있습니다**.

🤖 **동작 방식 (Atomic 연산)**
- `P(S) - (Wait/Acquire)` : 공유 자원을 획득하는 과정 (`S—-`). 자원이 없다면 대기
- `V(S) - (Signal/Release)` : 공유 자원을 반납하는 과정 (`S++`)

**두 가지 종류의 세마포어**
1️⃣ **Counting Semaphore**
- 0 이상의 임의의 정수값
- 주로 resource counting에 사용
- 공유 자원 갯수만큼 동시 접근 허용

2️⃣ **Binary Semaphore (=mutex)**
- `0 또는 1`값만 가질 수 있는 semaphore
- 주로 mutual exclustion (lock/unlock)에 이용

**🚨 세마포어 구현 방식: Busy Waiting vs Block-Wakeup**
세마포어를 구현할 때도 스핀락처럼 `Busy Waiting`이 발생할 수 있으나 현대 운영체제는 CPU 낭비를 막기 위해 `Block & Wakeup (Sleep Lock)` 방식으로 구현합니다. 

**🔴 Busy Waiting (스핀락 스타일)**
- 가장 원시적인 형태
```c
do {
  P(mutext);
  critical section
  V(mutext);
  //..  
} while(1);
```

- 누군가 임계영역에 들어가 있으면 while문을 돌면서 계속 할당된 CPU 시간을 사용

**🟢 Block & Wakeup (Sleep Lock 스타일)**
- **번호표를 뽑고 대기실(Wait Queue)에서 잠을 자는 방식**입니다.
```c
typedef struct {
  int value;             // 남은 자원의 수
  struct process *L;     // 대기 큐 (Sleep 상태인 프로세스들)
} semaphore;

// P(S) : 자원 획득
S.value--;
if (S.value < 0) {       // 자원이 0 이하로 떨어졌다면 남은 자원이 없다는 뜻
  block();               // 현재 프로세스를 대기 큐(L)에 넣고 Sleep(Block)
}

// V(S) : 자원 반납 (신호 보내기)
S.value++;
if (S.value <= 0) {      // 자원을 1개 늘렸음에도 0 이하라면? -> 누군가 기다리고 있다는 뜻!
  wakeup(P);             // 대기 큐(L)에서 프로세스를 하나 꺼내어 깨워줌(Wakeup)
}
```


> **동작 예시**

1. 자원이 1개(`S.value=1`) 남았습니다.
2. P0가 와서 1을 뺍니다. `S.value=0`. 음수가 아니니 P0는 작업하러 들어갑니다.
3. P1이 와서 1을 뺍니다. `S.value=-1`. 음수입니다! P1은 대기실에서 잠듭니다(`block`).
4. P2가 와서 1을 뺍니다. `S.value=-2`. 음수입니다! P2도 대기실에서 잠듭니다.
5. P0가 작업을 마치고 1을 더합니다. `S.value=-1`. **1을 더했는데도 0 이하이므로 누군가 자고 있다는 걸 알 수 있습니다!** P0는 대기실에서 P1을 깨웁니다(`wakeup`).

## ⚠️ 대표적인 동기화 문제 예시
### 1️⃣ Bounded-Buffer Problem (Producer-Consumer Problem)
크기가 유한한(Bounded) 공유 버퍼(배열, 큐 등)를 두고, 데이터를 만들어 넣는 **생산자(Producer)** 프로세스들과 데이터를 꺼내 쓰는 **소비자(Consumer)** 프로세스들이 동시에 접근할 때 발생하는 문제입니다.
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F4ca19032-7459-4c3a-bea5-a59fa43da2b6%2Fimage.png?table=block&id=321d67b9-9e80-807d-902a-d65f4a3739cd&cache=v2" alt="image" width="756" height="580" loading="lazy" />


발생하는 2가지 문제점과 해결책

| **문제** | **설명** | **해결** |
| ---- | ---- | ---- |
| **동시 접근 문제(Mutual Exclusion)** | 두 명의 생산자가 비어있는 동일한 버퍼 인덱스에 동시에 데이터를 쓰려고 하거나 두 명의 소비자가 동시에 같은 데이터를 꺼내가려 할 때 데이터가 꼬입니다 | 공유 버퍼에 접근하기 전 락(Lock)을 걸고 조작 후 해제하는 `이진 세마포어(Mutex)`가 필요 |
| **유한한 버퍼 크기** | 버퍼가 꽉 찼는데 생산자가 데이터를 넣으려 하거나 버퍼가 비었는데 소비자가 데이터를 꺼내려 하면 문제가 발생 | 비어있는 버퍼의 개수(Empty)와 채워진 버퍼의 개수(Full)를 추적하는 `카운팅 세마포어(Counting Semaphore)`가 필요 |

↗️ **생산자(Producer) 동작 과정**
1. 비어있는 버퍼 확인 - `P(empty)`
2. 버퍼 전체에 Lock - `P(mutex)`
3. 데이터 추가
4. UnLock - `V(mutex)`
5. 채워진 버퍼 1만큼 증가 - `V(full)`

↖️ **소비자(Consumer) 동작 과정**
1. 채워진 버퍼 확인 - `P(full)`
2. 버퍼 전체에 Lock - `P(mutex)`
3. 데이터 추출
4. UnLock - `V(mutex)`
5. 비어있는 버퍼 1만큼 증가 - `V(empty)`

### 2️⃣ Readers and Writers Problem
하나의 **공유 데이터(예: DB)**에 대해 **읽는 프로세스(Reader)**와 **쓰는 프로세스(Writer)**가 동시에 접근할 때의 문제입니다.
- 데이터를 단순히 **읽는 작업(Read)**은 내용이 변하지 않으므로 **여러 Reader가 동시에 접근해도 안전**
- 하지만 **쓰는 작업(Write)**은 데이터가 변형되므로 Writer가 접근할 때는 **다른 어떤 프로세스(Reader, Writer 모두)도 접근해서는 안 됩니다**.

💡 **해결 방법**
- 현재 데이터를 읽고 있는 프로세스의 수를 나타내는 `readcount`라는 공유 변수를 둡니다.
- Reader가 진입할 때 `readcount`를 1 증가시키고 최초의 Reader라면 DB에 락(Lock)을 겁니다. (이후 들어오는 Reader들은 락 없이 진입)
- 마지막 Reader가 나갈 때 `readcount`를 감소시키며 DB 락을 해제하여 비로소 Writer가 들어갈 수 있게 해줍니다.
- 이때 `readcount` 변수 자체도 공유 변수이므로 이를 조작할 때 Race Condition이 발생하지 않도록 `readcount` 전용 Mutex가 추가로 필요합니다

### 3️⃣ Dining-Philosophers Problem
5명의 철학자가 원탁에 앉아 식사(임계 영역 진입)와 생각(대기)을 반복합니다. 식사를 하려면 반드시 양쪽의 젓가락(공유 자원) 2개를 모두 쥐어야 합니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F66a08d7e-c88b-4861-b57f-c57e77f2f8cb%2Fimage.png?table=block&id=321d67b9-9e80-804d-89be-f2ee3cf477c2&cache=v2" alt="image" width="746" height="618" loading="lazy" />


💣** 위험 - **<span class="text-red">**데드락**</span>**의 위험이 존재**
- 5명의 철학자가 동시에 배가 고파져서 모두 자신의 **왼쪽 젓가락**을 먼저 집었다고 가정해 봅시다. 오른쪽 젓가락을 집으려 하지만 이미 옆 사람이 가져간 상태입니다. 
- 밥을 다 먹기 전까진 젓가락을 놓지 않으므로 모두가 영원히 굶는 **`교착 상태(Deadlock)`**에 빠집니다.

💡 **해결 방안**
1. 애초에 4명의 철학자만 테이블에 동시에 앉을 수 있게 제한합니다. (항상 빈 젓가락이 하나 남음)
2. 왼쪽/오른쪽 젓가락을 각각 집는 것이 아니라 **두 젓가락을 한 번에(Atomic)** 집을 수 있을 때만 집게 합니다.
3. **비대칭 규칙**: 홀수 번호 철학자는 왼쪽부터 짝수 번호 철학자는 오른쪽부터 집게 하여 순환 대기를 끊습니다

## 🤖 Monitor
앞서 세마포어(Semaphore) 방식에는 단점이 존재합니다.
1. **코딩이 너무 어렵고 휴먼 에러에 취약**: 개발자가 직접 `P()`와 `V()` 연산을 사용
2. **한 번의 실수가 시스템 전체를 마비시킴**: 만약 개발자가 실수로 `P()`를 하고 `V()`를 빼먹거나(Deadlock), `V()`를 먼저 해버리면(상호 배제 깨짐) 처리하기 힘든 버그가 발생합니다

> 🔍 **모니터(Monitor)**
> 프로그래밍 언어 차원에서 동기화를 추상화하여 지원하는 고수준 동기화 도구

🧩 **특징 및 동작 방식**
- 공유 자원과 이를 조작하는 함수(메서드, 프로시저)들을 하나의 모니터 박스(객체) 안에 넣어둡니다.
- 외부 프로세스는 공유 데이터에 직접 접근할 수 없고 **반드시 모니터 내부에 정의된 메서드를 통해서만 접근 가능합니다.**
- 모니터 자체가 `내부의 메서드는 한 번에 오직 하나의 프로세스만 실행할 수 있다`는** 상호 배제(Mutex)**를 언어 차원에서 보장합니다. 
  - 개발자가 락을 걸거나(`P()`) 풀(`V()`) 필요가 없습니다
  - 한 번에 하나의 프로세스만 내부 코드를 실행하도록 보장
- 내부에 조건 변수(Condition Variable)를 두어 `wait`와 `signal`을 관리

☕ **실제 적용 사례 - Java**
- Java의 모든 객체는 내부에 모니터를 하나씩 가지고 있습니다.
- 메서드 앞에 **`synchronized`** 키워드만 붙여주면 컴파일러와 JVM이 알아서 해당 구역을 모니터로 감싸 상호 배제를 보장합니다

## 📚 Ref.
<span class="inline-link" data-url="http://www.kocw.net/home/search/kemView.do?kemId=1046323" data-domain="kocw.net"></span>
<span class="inline-link" data-url="https://tecoble.techcourse.co.kr/post/2021-10-23-java-synchronize/" data-domain="tecoble.techcourse.co.kr"></span>
