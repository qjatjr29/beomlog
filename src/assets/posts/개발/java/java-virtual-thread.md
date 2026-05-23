---
id: "369d67b9-9e80-800e-8432-c72d0dfb2a78"
title: "⭐️ Java Virtual Thread"
slug: "java-virtual-thread"
category: "개발"
tags: ["Virtual Thread"]
date: "2026-05-23"
createdAt: "2026-05-23T05:15:00.000Z"
excerpt: "⭐ Virtual Thread :::callout JDK 21에 추가된 경량 스레드 :::callout - OS 스레드를 그대로 사용하지 않고 JVM 내부 스케줄링을 통해 수십수백..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fc559cd86-bc7e-4f02-b9f6-500e96ec468d%2Fimage.png?table=block&id=369d67b9-9e80-80bf-8e8c-e3d40f0d8bf6&cache=v2"
groupId: "364d67b9-9e80-8029-8cab-f5b0a3f733f3"
groupSlug: "java"
lastEdited: "2026-05-23T05:24:00.000Z"
---

## ⭐ Virtual Thread
:::callout **JDK 21에 추가된 경량 스레드**
:::callout - OS 스레드를 그대로 사용하지 않고 **JVM 내부 스케줄링**을 통해 `수십~수백만개`의 스레드를 동시에 사용할 수 있게 한다.

## 전통적인 Java Thread 모델
<figure>
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fc559cd86-bc7e-4f02-b9f6-500e96ec468d%2Fimage.png?table=block&id=369d67b9-9e80-80bf-8e8c-e3d40f0d8bf6&cache=v2" alt="Platform Thread (https://tech.kakaopay.com/post/ro-spring-virtual-thread/)" width="1534" height="762" loading="lazy" />
<figcaption>Platform Thread (https://tech.kakaopay.com/post/ro-spring-virtual-thread/)</figcaption>
</figure>

자바의 전통적인 스레드(Platform Thread)는 JVM 위에서 동작하지만 실제로는 운영체제(OS)의 커널 스레드와 **1:1로 매핑**됩니다. 
- `Java Native Interface(JNI)`를 사용해 `OS(Kernel) Thread`에 직접 매핑되도록 설계되었습니다.
- **Context Switching**을 통해 **OS 자체의 리소스를 점유**합니다.

| **한계 ** | **설명** |
| ---- | ---- |
| **비용** | 자바에서 `new Thread()`를 호출하는 것은 OS 레벨에서 진짜 스레드를 생성하는 것과 같아 생성 및 유지 비용이 매우 비쌉니다. |
| **리소스 한계** | OS 스레드는 무한정 생성할 수 없어 애플리케이션에서는 개수를 제한한 **Thread Pool**을 만들어 사용해야만 합니다. |
| **I/O Blocking의 비효율성** | `Thread Per Request`모델에서는 DB 조회나 외부 API 호출 등 I/O 작업이 발생하면 스레드가 멈춰서 대기(Blocking)하게 됩니다. |
|  | 결국 실제 연산보다 멍하니 대기하는 시간이 길어져 스레드를 효율적으로 사용하지 못하고 `처리량(Throughput)`에 병목이 발생합니다.  |

### Throughput (처리량)
기본적인 Web Request 처리 방식은 `Thread Per Request(하나의 요청 - 하나의 스레드)`로 처리량을 높이기 위해서는 많은 스레드가 필요합니다.
하지만 자바의 스레드는 OS 스레드를 **Wrapping**한 구조이기 때문에 OS 스레드를 무한정 늘릴 수 없어 처리량의 한계가 존재합니다.
### Blocking I/O
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F1a5850d7-0eb1-49f7-b512-5b78ac6ba2d7%2Fimage.png?table=block&id=369d67b9-9e80-80e5-b96e-cb5746e57c04&cache=v2" alt="image" width="1026" height="238" loading="lazy" />

Thread에서 <span class="text-blue">**I/O 작업**</span>을 처리할 때 <span class="text-red">**Blocking**</span>이 일어나는데 이로인해 **실제 작업을 처리하는 시간보다 대기하는 시간이 더 긴 문제가 있습니다.**
- 스레드를 효율적으로 사용하지 못함!!
## 📌 Reactive Programming
> 이러한 I/O Blocking 문제를 해결하기 위해 Spring WebFlux와 같은 <span class="text-red">**Reactive Programming**</span>이 도입되었습니다.

**장점: 스레드가 I/O를 대기하지 않고 즉시 다른 작업을 처리하므로 적은 스레드로도 높은 처리량을 낼 수 있습니다.**
하지만 WebFlux는 코드를 작성하고 이해하는데 비용이 높고 `Reactive`하게 동작을 하게 하기 위해서는 라이브러리 지원이 필요합니다.
- 동기식(MVC)에 비해 코드 작성과 이해가 훨씬 어렵습니다. (높은 러닝 커브)
- `JPA` 대신 `R2DBC` 같은 전용 `Non-blocking` 라이브러리를 강제합니다.
### 자바 디자인
**자바의 디자인은 스레드 중심**으로 구성되어 있습니다.
- `Exception Stack Trace`, `Debugger`, `Profiling` 모두 스레드 기반
이때, Reactive 작업을 할 때에는 이런 작업들이 하나의 스레드에서 처리되는 것이 아닌 여러 스레드를 거쳐서 처리가 되어 컨택스트 확인 및 디버깅이 어려워집니다.
👀 결국 높은 처리량을 확보했지만 개발 생산성이 낮아지는 문제가 있습니다.
## Virtual Thread의 등장과 해결하고자 하는 문제
> Virtual Thread는 Reactive의 복잡성을 버리고 **동기식 코드의 쉬운 개발 생산성과 비동기식의 높은 처리량을 모두 잡기 위해** 탄생했습니다.

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F8c37fa2f-48d8-4388-ac79-2d2d185d3576%2Fimage.png?table=block&id=369d67b9-9e80-80fe-b3b0-deafac152171&cache=v2" alt="image" width="678" height="382" loading="lazy" />

**Virtual Thread**는 Reactive가 지원하는 높은 처리량을 달성을 하고 코드 이해 수준에서는 MVC 스타일처럼 코드 이해가 쉽습니다.
🎯** 1. 애플리케이션의 **<span class="text-blue">**높은 처리량(throughput)**</span>** 확보**
- `I/O Blocking` 발생 시 **JVM** 내부 스케줄링을 통해 스레드가 다른 작업을 처리하게 합니다.
🎯 **2. **<span class="text-blue">**자바 플랫폼의 디자인과 조화**</span>
- MVC 스타일의 이해하기 쉬운 코드를 그대로 작성하면서도 기존 자바의 디버깅 및 프로파일링 도구들을 온전히 사용할 수 있습니다.

<figure>
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fdff5ffbd-efed-4d96-a04e-0f8995ddbdd8%2Fimage.png?table=block&id=369d67b9-9e80-80e4-8cc3-c86a54161f5b&cache=v2" alt="Virtual Thread의 기반이 되는 BaseVirtualThread 추상클래스: Thread를 상속 하고 있다." width="1358" height="502" loading="lazy" />
<figcaption>Virtual Thread의 기반이 되는 BaseVirtualThread 추상클래스: Thread를 상속 하고 있다.</figcaption>
</figure>

Virtual Thread의 기반이 되는 `BaseVirtualThread` 추상 클래스는 기존 `Thread` 클래스를 상속하고 있어 기존 스레드 관련 API들과 완벽히 호환됩니다.
## Virtual Thread 내부 구조
### 👀 **Platform Thread 구조**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Ff163d905-4e2a-4a8d-835a-0170dde704df%2Fimage.png?table=block&id=369d67b9-9e80-80fd-bb1e-d04da47cf818&cache=v2" alt="image" width="840" height="512" loading="lazy" />

애플리케이션이 JVM 안에서 Thread Pool을 통해 Thread를 사용합니다.
- 실제로는 OS 스레드를 사용 (1:1 매핑 구조)
### 🚀 Virtual Thread 구조
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F9e7be12b-e922-4f64-9cc9-214d422e576e%2Fimage.png?table=block&id=369d67b9-9e80-807b-b5a8-e45d692c30f1&cache=v2" alt="image" width="1082" height="504" loading="lazy" />

**Virtual Thread**는 OS 스레드와 1:1로 매핑되지 않고 JVM 내부의 `ForkJoinPool`을 통해 스케줄링됩니다.
- Virtual Thread 방식은 앞에 Virtual Thread들이 따로 존재합니다.
- 뒤에는 `Fork/Join Pool`이라는 Pool이 있는데 이 안에 있는 `Carrier Thread` 을 사용합니다.
**Carrier Thread은 **Virtual Thread의 실제 실행을 담당하는 플랫폼 스레드로 `OS Thread`와 <u>**매핑이 되는 구조**</u>지만 실제 애플리케이션에서는 Carrier Thread가 아닌 **Virtual Thread**만 사용합니다.
### Carrier Thread와 Mount / Unmount
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F0435de45-2fbc-4175-bb5b-2642dd9018ab%2Fimage.png?table=block&id=369d67b9-9e80-801c-87f2-ff878ce9807f&cache=v2" alt="image" width="1300" height="812" loading="lazy" />

**Virtual Thread가 어떤 작업을 할당받고 Carrier Thread와 연결되어 있는 구조입니다.**

| **Mount / Unmount** | **설명** |
| ---- | ---- |
| **Mount(연결)** | Virtual Thread가 할당받은 작업을 실행하기 위해 Carrier Thread에 올라타는 과정 |
| **Unmount(분리)** | 로직 실행 중 **I/O Blocking(DB 대기 등)이 발생하면 Virtual Thread는 즉시 Carrier Thread에서 내려옵니다(Unmount)** |

> 🚀  **빈 Carrier Thread는 놀지 않고 곧바로 대기 중인 다른 Virtual Thread를 Mount하여 작업을 이어갑니다.**
> - 기존에는 스레드가 통째로 멈춰 낭비되었지만 이 구조 덕분에 OS 스레드 수에는 제한이 있어도 **수십~수백만 개의 Virtual Thread**를 동시에 띄워 I/O 대기 시간을 완벽하게 활용할 수 있습니다.

## Platform Thread vs Virtual Thread 리소스 비교
**실제 OS Thread의 수에 제한이 있지만 Virtual Thread의 수가 엄청나게 늘어나 사용할 수 있는 구조가 됩니다.**
따라서 Virtual Thread가 많아지면 관리를 위해서 사용하는 자원도 작게 유지를 해주어야 합니다.
- Virtual Thread는 메타데이터와 메모리 구조를 경량화했습니다.
### 사용하는 자원

| **비교 항목** | **Platform Thread** | **Virtual Thread** |
| ---- | ---- | ---- |
| **메타데이터 크기** | 약 2KB (OS별 상이) | **200 ~ 300 Byte** |
| **메모리 구조** | 미리 크게 할당된 OS Stack 메모리 사용 | 필요시 **JVM Heap** 메모리 사용 |
| **컨텍스트 스위칭 비용** | 1 ~ 10µs (커널 영역에서 발생하여 무거움) | **ns (나노초 단위, JVM 레벨 수행)** |

## 🧑‍💻 Virtual Thread 사용법
### ☕ Java 코드 적용 예시
```java
public class VirtualThreadTest {
    public static void main(String[] args) throws InterruptedException {
        
        Runnable runnable = () -> {
            System.out.println("Hi from a virtual thread!");
        };

        // 방법 1. Thread.startVirtualThread()
        Thread vThread1 = Thread.startVirtualThread(runnable);

        // 방법 2. Thread.ofVirtual()
        Thread vThread2 = Thread.ofVirtual().start(runnable);

        // 방법 3. Thread.Builder 사용 (이름 지정 등)
        Thread.Builder builder = Thread.ofVirtual().name("VirtualThreadBuilder");
        Thread vThread3 = builder.start(runnable);

        // 방법 4. ExecutorService 사용 (권장)
        try (final ExecutorService executorService = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 3; i++) {
                // Task마다 무제한으로 새로운 가상 스레드 할당
                executorService.submit(runnable);
            }
        }

        // Virtual Thread 여부 확인 API
        System.out.println("Thread is Virtual? " + vThread1.isVirtual()); 
    }
}
```

#### ✅ **실행 결과**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F4be8a507-f22f-40a1-9225-0eedb6a3a802%2Fimage.png?table=block&id=369d67b9-9e80-8093-8053-e9f9e69119f1&cache=v2" alt="image" width="488" height="320" loading="lazy" />

### 🍃 Spring Boot (MVC) 적용 방법
**Spring Boot 3.2** 버전 이상부터는 복잡한 Bean 설정 없이 설정 파일(`application.yml`)에 단 한 줄만 추가하면 Tomcat의 요청 처리 및 비동기 처리(`@Async`)에 Virtual Thread가 전면 적용됩니다.
```yaml
# application.yml
spring:
  threads:
    virtual:
      enabled: true
```

## ⚠️ Virtual Thread 도입 시 주의사항
### 1️⃣ 절대 가상 스레드를 풀링(Pool)하지 마라 (Task 단위 할당)
기존 Platform Thread에서 Virtual Thread로 넘어갈 때는 스레드를 바라보는 시각 자체를 완전히 바꿔야 합니다.
- **버려야 할 관행 (Pooling):** 스레드가 귀해서 `FixedThreadPool` 같은 스레드 풀을 만들어 재사용하던 습관을 버려야 합니다. 튜닝해 둔 풀의 스레드 종류만 Virtual Thread로 바꾼다고 해서 극적인 성능 체감을 느끼기 어렵습니다.
- **새로운 패러다임 (1 Task = 1 Virtual Thread):** 가상 스레드는 풀링의 대상이 아니라 `작업(Task) 그 자체`입니다. **하나의 개별 Task(요청)가 들어올 때마다 하나의 Virtual Thread를 할당(Allocate)하고 버리는(Discard) 단위**로 접근해야 합니다.
- 즉, **요청마다 새로 생성(Allocate)** 하고 작업 완료 시 가비지 컬렉터(GC)가 수거
### 2️⃣ 동시성 제한(스로틀링)은 스레드 풀 대신 세마포어(Semaphore)를 써라
과거에는 외부 API나 DB 커넥션 등 한정된 자원을 보호하기 위해 진입하는 스레드 풀의 크기 자체를 작게 제한(Throttle)하는 방식을 썼습니다. 
하지만 가상 스레드는 수십만 개가 한 번에 쏟아지므로 자원 고갈(<span class="text-red">**Overwhelming**</span>)을 막을 새로운 방어막이 필요합니다.
💡 **가상 스레드 환경에서는 제한된 자원에 접근하기 전 세마포어(Semaphore)를 사용하여 진입 개수를 물리적으로 제한해야 합니다.**
```java
// 외부 서비스 접근을 동시에 10개로 제한하는 세마포어
private final Semaphore sem = new Semaphore(10);

public Result accessLimitedResource(){
    sem.acquire(); // 최대 10개만 통과, 나머지 가상 스레드는 가볍게 대기(Park)
    try {
        return callLimitedService(); // 외부 API 호출 또는 DB 쿼리
    } finally {
        sem.release(); // 반드시 락 해제
    }
}
```

### 3️⃣ 복잡한 비동기 코드를 버리고 '단순한 동기식 블로킹'으로 돌아가라
기존에는 플랫폼 스레드가 I/O 대기(Blocking)로 인해 멈추는 것을 막으려고 `CompletableFuture`나 `WebFlux` 같은 복잡한 비동기 리액티브 코드를 짰습니다.
- 가상 스레드 환경에서는 스레드가 멈추는(Blocking) 비용이 적어 대기하는 동안 알아서 Carrier Thread를 반납하고 다른 작업을 처리합니다.
- 따라서 흐름을 파악하기 힘든 비동기 코드 대신 **직관적이고 읽기 쉬운 전통적인 동기식(Blocking I/O) 코드**를 작성하는 것이 유리합니다.
### 4️⃣ ThreadLocal 사용 시 메모리 폭발(OOM) 주의
:::callout Platform Thread 환경(예: Tomcat 스레드 200개)에서는 데이터 공유나 컨텍스트(사용자 인증 정보, 트랜잭션 등) 유지를 위해 `ThreadLocal`을 사용하는 것이 흔한 패턴이었습니다.
**Virtual Thread**는 OS가 아닌 **JVM의 Heap 메모리 영역**에 객체 형태로 할당됩니다.
:::callout ⚠️
:::callout **메모리 이슈 발생**
:::callout **수만~수백만 개의 Virtual Thread**가 생성되는 환경에서 내부에 무거운 객체를 `ThreadLocal`로 계속 할당한다면 Heap 메모리를 순식간에 점유하여 심각한 <span class="text-red">**메모리 부족 현상(OutOfMemoryError)**</span>을 유발할 수 있습니다.
따라서 가급적 가벼운 데이터를 다루거나 다른 컨텍스트 전파 방식을 고려해야 합니다.
- <span class="text-blue">**Scoped Values**</span>
:::callout **Scoped Values**
:::callout - `ThreadLocal`과 달리 불변(Immutable)이며 지정된 블록(Scope) 안에서만 유효하고 블록이 끝나면 GC를 기다릴 필요 없이 즉시 메모리에서 해제
:::callout - 수백만 개의 Virtual Thread가 동일한 Scoped Value를 안전하고 아주 가볍게 공유할 수 있습니다.
### 3️⃣ Carrier Thread Pinning (고정 현상) 주의
Virtual Thread의 핵심은 I/O 대기 시 자신이 업혀 있던 실제 OS 스레드(**Carrier Thread**)를 반환하고 물러나는 것입니다. 
그런데 특정 상황에서는 Virtual Thread가 Carrier Thread를 놓아주지 못하고 꽉 쥐고 있는 현상이 발생하는데 이를 <span class="text-red">**Pinning(피닝)**</span>이라고 합니다.
- `synchronized` 블록이나 메서드 내부에서 로직이 실행 중일 때
- JNI (Java Native Interface)를 통한 Native 메서드를 호출할 때
이런 상황에서는 Carrier Thread 자체가 블로킹되어 전체 애플리케이션의 성능이 급격히 저하됩니다. 
따라서 사용하고 있는 서드파티 라이브러리 내부에 `synchronized`가 사용되고 있을 수 있으므로 확인을 해주어야 합니다.
:::callout 💡 
:::callout **디버깅 팁:** JVM 실행 옵션에 `-Djdk.tracePinnedThreads=full`을 추가하면 피닝이 발생하는 지점을 로그로 추적할 수 있습니다.
#### ✅ `synchronized`를 사용하는 라이브러리들

| 클래스 | **대안 (Non-blocking)** |
| ---- | ---- |
| `Hashtable` | `ConcurrentHashMap` |
| `Vector` | `ArrayList` + 외부 Lock (`ReentrantLock`) |
| `StringBuffer` | `StringBuilder` (단일 스레드 환경 시) |
| `Collections.synchronizedXxx()` | `ConcurrentXxx` (예: `ConcurrentLinkedQueue`) |

#### 💡 해결책: ReentrantLock으로 우회하기
만약 동기화 처리가 반드시 필요하다면 Pinning을 유발하는 `synchronized` 키워드 대신 `java.util.concurrent.locks.ReentrantLock`을 사용하여 코드를 리팩토링해야 Carrier Thread 반환이 정상적으로 이루어집니다.
**❌ AS-IS (Pinning 발생 코드)**
```java
public synchronized String accessResource(){
    return access(); // I/O 대기 시 Carrier Thread까지 같이 블로킹 됨
}
```

**🟢 TO-BE (ReentrantLock 적용 코드)**
```java
private static final ReentrantLock LOCK = new ReentrantLock();

public String accessResource(){
    LOCK.lock(); // Virtual Thread만 대기 상태로 전환됨
    try {
        return access();
    } finally {
        LOCK.unlock(); // 예외가 발생해도 반드시 Lock을 해제하도록 finally 사용
    }
}
```

## 🧑‍💻 성능 테스트
### 🧪 테스트 환경

| **환경** | **값** |
| ---- | ---- |
| **OS** | Mac OS (Apple Silicon) |
| **CPU** | 10 Core |
| **Memeory** | 16G |
| **Java** | Java 21 |
| **빌드 도구** | Gradle 8.4 |
| **JVM Option** | Max Heap 2G |

### 🐳 Docker - k6
#### 1️⃣ 작업 폴더 생성
터미널을 열고 부하 테스트를 진행할 폴더를 만든 뒤, 해당 폴더로 이동합니다.
```bash
mkdir k6-test
cd k6-test
```


#### 2️⃣ k6 스크립트 작성(load-test.js)
```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1000,       // 1000명의 가상 사용자 동시 접속
  duration: "30s", // 30초 동안 테스트 진행
};

export default function () {
  // Docker 안에서 Mac의 스프링 부트(localhost)로 접속하기 위한 주소입니다.
  const url = "http://host.docker.internal:8080/block";

  const res = http.get(url);

  // 서버가 200 정상 응답을 주었는지 확인
  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  // 요청을 보낸 후 1초 대기
  sleep(1);
}
```

:::callout `1,000`명의 동시 사용자가 `30`초 동안 요청을 보내는 상황

#### 3️⃣ Spring Boot 애플리케이션 실행
부하를 받을 서버를 실행합니다. 
- `Virtual Thread` 비활성화 상태 / 활성화 상태 두 가지로 나눠서 진행

#### 4️⃣ Docker로 부하테스트 실행
```bash
docker run --rm -i -v $(pwd):/scripts grafana/k6 run /scripts/load-test.js
```

:::callout **명령어 의미**
:::callout - `v $(pwd):/scripts`: 현재 Mac의 폴더를 도커 안의 `/scripts` 폴더와 연결하여 스크립트 파일을 읽을 수 있게 합니다.
:::callout - `grafana/k6 run ...`: 공식 k6 이미지를 가져와서 부하 테스트를 실행합니다.
:::callout - `-rm`: 테스트가 끝나면 도커 컨테이너를 깔끔하게 삭제합니다.
:::callout - `-i`: 대화형 모드로 터미널에 실시간 진행 상황을 출력합니다.
### 👊 시나리오1. 비즈니스 로직에 Thread Blocking이 발생하는 상황
비즈니스 로직 처리 중 스레드가 단순 대기(Sleep)하는 상황
```java
@GetMapping("/block")
public String getBlockedResponse() throws InterruptedException {
    Thread.sleep(1000); // 비즈니스 로직 처리에 thread가 blocking 되는 상황
    return "OK";
}
```

#### 🧩 테스트 결과 및 해석 (Platform Thread)

| **측정 지표** | **결과 수치** |
| ---- | ---- |
| **총 소요 시간** | 34.6초 |
| **총 처리 건수** | 6,621건 |
| **초당 처리량 (TPS)** | 191.45건 / 초 |
| **응답 지연 시간** | 평균: 3.87초 / 최대: 5.22초 |

💡 **주요 지표 해석**
- **톰캣 스레드 풀의 물리적 한계(TPS):** 로직 처리에 1초가 걸리고 톰캣 기본 스레드가 200개이므로 서버가 1초에 소화할 수 있는 최대 요청량이 200건 수준에서 물리적인 병목(Throttle)이 발생했습니다.
- **대기열(Queue) 정체 현상:** 실제 비즈니스 로직은 1초짜리지만 스레드를 할당받지 못한 나머지 800명은 톰캣 내부 큐에서 대기해야 했습니다. 늦게 도착한 요청일수록 큐 대기 시간이 길어져 최대 5.2초까지 지연되었습니다.
- **총 소요 시간 (34.6초):** 30초 테스트 종료 후 이미 큐에 들어와 있던 마지막 요청들이 처리될 때까지 대기한 최종 시간입니다.

#### 🚀 테스트 결과 및 해석 (Virtual Thread)

| **측정 지표** | **결과 수치** |
| ---- | ---- |
| **총 소요 시간** | 31.6초 |
| **총 처리 건수** | 15,216건 |
| **초당 처리량 (TPS)** | 481.83건 / 초 |
| **응답 지연 시간** | 평균: 1.0초 / 최대: 1.1초 |

💡 **주요 지표 해석**
- **높은 처리량 (TPS):** 요청이 들어오는 즉시 `Virtual Thread`가 할당되어 I/O 대기를 수행하므로 `Platform Thread` 대비 **2.3배 이상** 많은 요청을 처리했습니다.
- **대기 시간 거의 없음:** 코드의 실제 수행 시간(Sleep - 1초)과 응답 시간이 동일합니다. 1,000명이 동시에 몰려도 큐 대기 없이 거의 즉시 처리되었습니다.

### 👊 시나리오2. 실제 쿼리 질의
데이터베이스 커넥션을 점유하고 1초 동안 대기하는 실제 비즈니스 로직 병목 상황
```java
@GetMapping("/query")
public String query() {
    return jdbcTemplate.queryForList("SELECT sleep(1)").toString();
}
```

#### 🧩 테스트 결과 및 해석 (Platform Thread)

| **분석 지표** | **결과 수치** |
| ---- | ---- |
| **총 소요 시간** | 60.1초 |
| **실제 성공 / 실패** | 성공: 590건 / 실패: 132건 |
| **실제 성공 TPS** | 약 9.8건 / 초 |
| **응답 지연 시간** | 평균: 29.8초 / 최대: 58.8초 |

💡 **주요 지표 해석**
- **HikariCP 커넥션 풀 한계 (TPS):** DB 쿼리에 1초가 걸리고 커넥션이 10개뿐이므로 서버가 1초에 소화할 수 있는 물리적 최대 한계인 10 TPS에 수렴했습니다.
- **극단적인 응답 지연:** 사용자는 단 1초짜리 데이터를 받기 위해 톰캣 큐와 HikariCP 큐에서 이중으로 줄을 서며 최대 1분에 가까운 대기를 겪었습니다.
- **총 소요 시간:** 테스트가 끝난 후에도 큐에 밀려있는 요청을 처리하다가, 최대 유예 시간(Graceful Stop 30초)에 도달하여 강제 종료되었습니다. 실패한 132건은 운영체제(OS) 대기열을 초과했거나 타임아웃이 발생한 건입니다.

#### 🚀 테스트 결과 및 해석 (Virtual Thread)

| **분석 지표** | **결과 수치** |
| ---- | ---- |
| **총 소요 시간** | 53.4초 |
| **실제 성공 / 실패** | 성공: 501건 / 실패: 798건 |
| **실제 성공 TPS** | 약 9.38건 / 초 |
| **응답 지연 시간** | 중간값(med): 30.36초 / 최대: 32.01초 |

💡 **주요 지표 해석**
- **HikariCP Connection Timeout 대량 발생:** 앞단의 톰캣 방어막이 사라져 1,000개의 접속이 그대로 DB로 향했습니다. DB 커넥션(10개)을 얻지 못한 60% 이상의 요청이 결국 에러를 반환하며 터져버렸습니다.
- **최종 병목 지점 도달 (TPS):** 시스템 전체의 처리량은 결국 데이터베이스 커넥션 풀(10개)이라는 최종 물리적 한계에 부딪혀 10 TPS 미만으로 고정됨을 보여줍니다.
- **응답 지연 (중간값 30.36초):** 대다수의 실패한 요청들이 HikariCP의 `connectionTimeout` 기본값인 30,000ms(30초)를 꽉 채워 기다리다가 예외를 던지고 실패했음을 의미합니다.

#### ✅ 실제 쿼리 질의상황에서 Platform Thread와 Virtual Thread의 처리
1️⃣ **Platform Thread: "이중 병목과 스로틀링"**
1,000명이 몰려왔지만 **1차 관문(Tomcat 스레드 200개)**이 방어막 역할을 합니다. 
서버에 들어온 200명 중 10명만 **2차 관문(DB 커넥션)**을 점유하고 190명은 HikariCP 큐에서 대기합니다. 
결과적으로 사용자 응답은 매우 느려지지만 톰캣이 스로틀(Throttle) 역할을 수행하여 하위 시스템인 DB가 한 번에 죽는 일은 막아줍니다.

2️⃣ **Virtual Thread: **<span class="text-red">**Overwhelming**</span>
톰캣은 요청이 오자마자 빠르게 1,000개의 `Virtual Thread`를 생성하여 비즈니스 로직으로 통과시킵니다. 10개만 DB와 연결되고 990개의 스레드가 HikariCP 앞에서 대기 상태에 빠집니다.
결국 30초가 경과하는 순간 대기하던 수백 개의 스레드들이 일제히 `SQLTransientConnectionException`을 던지며 시스템 전체의 연쇄 장애(**Overwhelming**)를 유발합니다.

### 🎯 최종 정리 및 결론
테스트 결과, 단순 I/O 대기 상황에서는 `Virtual Thread`가 월등한 처리량을 보여주었으나 실제 DB 아키텍처에서는 다음과 같은 명확한 한계와 시스템 특성을 확인했습니다.
- **기존 Thread Pool (Platform Thread):** 비싸고 무거워서 전체 TPS는 제한되지만 톰캣 레벨에서 스레드 풀 개수를 통해 강력한 **방어막(Throttle)** 역할을 수행합니다. 이를 통해 하위 DB 인프라가 붕괴되는 것을 효과적으로 방지합니다.
- **Virtual Thread:** 애플리케이션의 동시 처리량을 극단적으로 끌어올리지만 스로틀 방어막이 사라집니다. 뒷단의 하위 시스템(DB 커넥션, 외부 API 등)이 수용할 수 있는 한계를 넘는 트래픽이 유입될 경우 대량의 타임아웃과 예외 객체 생성으로 인해 서버 시스템 전체의 연쇄 장애(`Overwhelming`)로 이어질 수 있습니다.

> ✅ `Virtual Thread`를 도입하여 처리량을 높일 때는 유실된 기존 톰캣의 스로틀 기능을 대체할 수 있도록 **애플리케이션 레벨에서의 백프레셔(Backpressure) 및 트래픽 제어 설계(ex. Semaphore 활용)가 반드시 동반**되어야 합니다!

## 📌 Virtual Thread 유즈케이스와 오해
### Virtual Thread가 적합한 경우 (Use Cases)
> `Virtual Thread`는 모든 상황에 좋은 것이 아니기 때문에 애플리케이션의 특성에 따라 도입 여부를 결정해야 합니다.

#### ✅ **I/O Blocking이 잦은 워크로드**
- 데이터베이스 접근, 외부 API (HTTP) 호출, 파일 읽기/쓰기 등 **I/O 병목으로 인해 스레드가 대기(Waiting)하는 시간이 긴 로직**에서 최고의 효율을 냅니다.
#### ✅ **Spring MVC 기반의 Web API 서비스**
- 개발자가 새로운 비동기 프로그래밍 모델을 배울 필요 없이 기존의 익숙한 동기식(Blocking) 코드 스타일을 그대로 유지하면서도 극대화된 동시성을 누릴 수 있어 매우 편리합니다.
#### 💡 **WebFlux (Reactive)의 훌륭한 대안**
- 높은 처리량(Throughput)을 달성하기 위해 러닝 커브가 높고 디버깅이 까다로운 `WebFlux` 도입을 고려 중이었다면 기존 Spring MVC에 Virtual Thread를 적용하는 것이 비용 대비 훨씬 훌륭한 대안이 될 수 있습니다.
#### ❌ **CPU Intensive 작업에는 부적합**
- 암호화, 동영상 인코딩, 복잡한 수학 연산 등 스레드가 쉬지 않고 CPU를 지속적으로 점유하는 작업에서는 이점이 없습니다. 
- 오히려 기존처럼 OS의 스케줄링을 받는 Platform Thread를 사용하는 것이 적합할 수 있습니다.
### Virtual Thread에 대한 오해
#### **1️⃣ 기존 Platform Thread를 완전히 대체하는 기술이다? (❌)**
**Virtual Thread**는 **Platform Thread**를 없애기 위해 나온 것이 아닙니다. 
- 소수의 Carrier Thread 위에서 수천, 수만 개의 Virtual Thread를 교대로 실행 (Mount/Unmount)시키는 구조입니다. 
- 두 스레드는 각자의 역할에 맞게 **공존**하는 관계입니다.

#### **2️⃣ 도입하기만 하면 무조건 서버의 처리량(TPS)이 높아진다? (❌)**
앞선 부하 테스트에서 확인한 것처럼 **Virtual Thread**가 서버 앞단의 동시 접속 수용량은 늘려주지만 **하위 시스템(DB 커넥션 풀, 외부 인프라 등)의 물리적 한계까지 늘려주지는 않습니다.** 
백엔드 자원이 병목이라면 최종 처리량은 증가하지 않으며 오히려 연쇄 장애(<span class="text-red">**Overwhelming**</span>)를 유발할 수 있습니다.

#### **3️⃣ Java의 동시성(Concurrency) 문제를 완전히 해결했다? (❌)**
Virtual Thread는 수많은 스레드를 가볍게 만들 수 있게 해 주었을 뿐 멀티 스레드 환경에서 발생하는 고질적인 문제(Race Condition, 데드락 등)를 원천적으로 막아주지는 않습니다. 
동시성 제어에 대한 개발자의 책임은 여전히 남아 있습니다.

#### **4️⃣ 연산 속도 자체가 빨라지는 마법이다? (❌)**
Virtual Thread는 단일 작업의 처리 속도(Latency)를 줄여주는 기술이 아닙니다. 
기존의 `Blocking(I/O 대기)에 대한 개선`이자 자바 플랫폼 디자인과의 조화를 통해 **적은 자원으로 더 많은 작업을 동시에 품을 수 있게(Throughput 향상) **해주는 기술입니다.
## 📚 Ref.
<span class="inline-link" data-url="https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html#GUID-04C03FFC-066D-4857-85B9-E5A27A875AF9" data-domain="docs.oracle.com"></span>
<span class="inline-link" data-url="https://www.youtube.com/watch?v=vQP6Rs-ywlQ" data-domain="youtube.com"></span>
<span class="inline-link" data-url="https://www.youtube.com/watch?v=BZMZIM-n4C0&t=4s" data-domain="youtube.com"></span>
<span class="inline-link" data-url="https://d2.naver.com/helloworld/1203723" data-domain="d2.naver.com"></span>
<span class="inline-link" data-url="https://techblog.lycorp.co.jp/ko/about-java-virtual-thread-1" data-domain="techblog.lycorp.co.jp"></span>
<span class="inline-link" data-url="https://tech.kakaopay.com/post/ro-spring-virtual-thread/" data-domain="tech.kakaopay.com"></span>
<span class="inline-link" data-url="https://mangkyu.tistory.com/309" data-domain="mangkyu.tistory.com"></span>
