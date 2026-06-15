---
id: "380d67b9-9e80-80ef-9d6f-da25a077e6e5"
title: "쉼 없이 CPU를 활용하는 가볍고 부지런한 가상 스레드"
slug: "쉼-없이-cpu를-활용하는-가볍고-부지런한-가상-스레드"
category: "책"
tags: ["가상스레드"]
date: "2026-06-15"
dateEnd: ""
createdAt: "2026-06-15T13:13:00.000Z"
excerpt: ":::callout 🎯 챕터 목표 :::callout - 가상 스레드를 실습 중심으로 소개한다. :::callout - 가상 스레드가 무엇이며 플랫폼 스레드와 어떻게 다른지 그리..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F10056fd0-5ac7-4be9-ba05-4c3da7e08e4d%2Fimage.png?table=block&id=380d67b9-9e80-8084-9292-fad18725c685&cache=v2"
groupId: "37cd67b9-9e80-80a0-a6dd-f18dd6a44395"
groupSlug: "모던-자바-동시성-프로그래밍"
lastEdited: "2026-06-15T13:14:00.000Z"
---

:::callout 🎯 **챕터 목표**
:::callout - <span class="text-red">**가상 스레드**</span>를 실습 중심으로 소개한다.
:::callout - **가상 스레드**가 무엇이며 `플랫폼 스레드`와 어떻게 다른지 그리고 어떻게 생성하는지를 배운다.
:::callout - 처리량과 확장성 개선을 다루는 실용적인 예제를 다루며 주요 주제로는 **세마포어를 활용한 요청 제한**과 **스레드 고정**, **ThreadLocal 관련 고려사항**과 같은 중요한 제약이 포함된다.

가상 스레드는 자바 동시성 도구에 추가된 획기적인 기능으로 스레드를 굉장히 큰 규모의 동시성을 다루는 데 필수적인 기본 단위로 사용하는 것이 현실적으로 가능해졌다.
운영체제가 관리하는 스레드에서 JVM이 관리하는 스레드로의 전환은 단순 구현 세부 내용만 달라진 것이 아니다.
애플리케이션의 메모리 고갈이나 성능 저하 없이 수백만 개의 스레드를 생성해서 사용하는 방식은 전통적인 플랫폼 스레드에서는 아예 불가능했지만 가상 스레드를 사용하면 가능하고 훨씬 더 편리하게 동시성 프로그램을 작성할 수 있게 됐다.

## ⭐ 가상 스레드
<span class="text-red">**가상 스레드**</span>는 `JVM`에 의해 관리되기 때문에 스케줄링 및 관리를 운영체제에 의존하던 전통적인 플랫폼 스레드보다 훨씬 더 효율적으로 동작한다.
가상 스레드는 <span class="text-red">**캐리어 스레드**</span>위에서 실행되는 데 이는 본질적으로 `포크/조인 풀`에서 가져온 스레드이다.
이 덕분에 가상 스레드는 고급 `스레드 풀링 메커니즘`과 효율적인 `Work-Stealing` 알고리즘 장점을 그대로 물려받았다.

:::callout 💡**가상 스레드 스케줄러 동작 방식**
:::callout JVM 내부에 구현된 가상 스레드 스케줄러는 Work-Stealing 방식의 `ForkJoinPool`을 기반으로 하지만 `선입선출(FIFO)`모드로 동작한다.
:::callout - `ForkJoinPool` 은 가상 스레드 스케줄링의 토대가 되며 후입선출(LIFO) 모드로 동작하는 병렬 스트림과 같은 다른 목적의 공용 풀과는 다르다.

### 자바의 두 가지 스레드 유형
가상 스레드가 도입되면서 자바에는 **플랫폼 스레드**와 **가상 스레드** 이렇게 두 가지 종류의 스레드가 존재한다.
<figure>
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F10056fd0-5ac7-4be9-ba05-4c3da7e08e4d%2Fimage.png?table=block&id=380d67b9-9e80-8084-9292-fad18725c685&cache=v2" alt="가상 스레드와 캐리어 스레드의 스케줄링" width="864" height="776" loading="lazy" />
<figcaption>가상 스레드와 캐리어 스레드의 스케줄링</figcaption>
</figure>


| **분류** | **플랫폼 스레드 (Platform Thread)** | **가상 스레드 (Virtual Thread)** |
| ---- | ---- | ---- |
| **개념** | 자바가 만들어졌을 때부터 존재하던 전통적인 **네이티브 스레드** | `JDK 21`부터 새로 도입된 자바의 **동시성 모델** |
| **관리 주체** | **운영체제(OS)**에 의해 실행되며 스케줄링과 관리를 운영체제에 의존 | **JVM(자바 가상 머신)**에 의해 관리 |
| **매핑 관계** | 자바 스레드와 커널 스레드 사이에 **일대일(1:1)** 관계를 유지 | 직접적으로 커널 스레드와 매핑되지 않고 다수의 가상 스레드가 적은 수의 **캐리어 스레드 풀을 공유**합니다. |
| **자원 효율성** | 운영체제에 의해 실행되는 **무거운 스레드** | 수백만 개의 스레드를 생성하더라도 **시스템 자원이 고갈되지 않는 가벼운 스레드** |
| **작동 메커니즘** | 운영체제의 스케줄링과 컨텍스트 스위칭 메커니즘을 그대로 활용 | JVM이 상대적으로 적은 운영체제 자원으로도 많은 수의 가상 스레드를 효율적으로 다중화(Multiplexing) |

### 플랫폼 스레드와의 차이점

| **특징** | **설명** |
| ---- | ---- |
| **가벼움 ** | 가상 스레드는 플랫폼 스레드에 비해 훨씬 적은 양의 메모리를 사용하며 시스템 자원 소모가 적어 수백만 개의 가상 스레드를 동시에 생성하더라도 시스템 자원이 고갈되지 않는다. |
| **스케줄링** | 운영체제(OS)가 아닌 **JVM에 의해 직접 스케줄링** 되어 CPU 사이클을 낭비 없이 효율적으로 사용하며 기존 OS 스레드 스케줄링에서 발생하던 오버헤드를 피할 수 있다. |
| **블로킹 허용 능력** | 블로킹 연산을 수행할 때도 성능 저하가 발생하지 않는다. 블로킹 발생 시 시스템 자원을 점유한 채로 대기하지 않고 **제어권을 캐리어 스레드에게 즉시 넘겨 **대기 중인 다른 가상 스레드들이 멈춤 없이 효율적으로 실행될 수 있다. |
| **통합** | 기존 코드베이스를 크게 변경할 필요 없이 매끄럽게 통합되도록 설계되어 기존에 사용해 온 코딩 패턴이나 추상화 기법을 그대로 이어서 사용할 수 있다. |

## ⚙️ 가상 스레드 사용 준비
**가상 스레드**는 `JDK 21`부터 안정적으로 지원되므로 `JDK 21`이 설치돼 있어야 한다.
### 가상 스레드 생성
#### 1️⃣ Thread.startVirtualThread() 호출
```java
Thread.startVirtualThread(() -> {
  System.out.println("hi"); 
});
```

이 코드를 실행하면 콘솔에 메시지가 출력되지 않는다.
> 가상 스레드는 기본적으로 <span class="text-brown">**데몬 스레드**</span>이다.
> - 따라서 가상 스레드를 생성한 메인 스레드 실행이 끝나면 JVM은 남아 있는 데몬 스레드도 함께 종료시킨다.

따라서 가상 스레드의 태스크를 정상적으로 실행하려면 가상 스레드 태스크 실행이 끝날 때 까지 기다려야 한다.
```java
Thread vThread = Thread.startVirtualThread(() -> {
  System.out.println("hi"); 
});

vThread.join();
```


#### 2️⃣ Thread Builder API 사용
```java
var startedThread = Thread.ofVirtual()
		.start(() -> System.out.println("hi"));
startedThread.join();
```


가상 스레드 생성과 태스크 실행 시작을 분리할 수도 있다.
```java
var unstartedThread = Thread.ofVirtual()
		.unstarted(() -> System.out.println("hi"));

unstartedThread.start(); // 가상 스레드 생성 후 필요할 때 실행 시작
```


#### 3️⃣ Executor 사용하고 있는 경우
```java
try (var virtualExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
	 Future<String> future = virtualExecutor.submit(this::testService);
}
```


## 가상 스레드에 적응하기
가상 스레드의 도입은 개발자의 편의성을 최적화하는 방식으로 이루어졌다.
가상 스레드는 본질적으로 **Thread 클래스의 인스턴스**이며 취소 역시 플랫폼 스레드와 마찬가지로 `interrupt()` 메서드를 호출해 처리할 수 있다.
- 스레드 내부에서 실행되는 코드는` interrupted 플래그`를 직접 확인하거나 대부분의 블로킹 메서드를 사용할 때와 마찬가지로 인터럽트를 자동으로 처리하는 메서드를 호출해야 한다.

#### 🆚 플랫폼 스레드와 가상 스레드의 인터럽트 처리 예제
**플랫폼 스레드 인터럽트 예제**
```java
public class PlatformThreadInterruption {

    public static void main(String[] args) {
        Thread platformThread = Thread.ofPlatform().start(() -> { // ①
            try {
                System.out.println("Platform thread started...");
                for (int i = 0; i < 5; i++) {
                    System.out.println("Platform thread working: " + i);
                    Thread.sleep(1000); // 작업 실행 시뮬레이션
                }
                System.out.println("Platform thread finished.");
            } catch (InterruptedException e) { // ②
                System.out.println("Platform thread interrupted!");
                // 인터럽트에 의한 뒤처리
            }
        });

        try {
            Thread.sleep(2500); // 일정 시간동안 스레드가 계속 실행되게 한다. ③
        } catch (InterruptedException e) {
        }

        platformThread.interrupt(); // ④
    }
}

-------------결과---------------
Platform thread started...
Platform thread working: 0
Platform thread working: 1
Platform thread working: 2
Platform thread interrupted!
```


**가상 스레드 인터럽트 처리 예제**
```java
public class VirtualThreadInterruption {

    public static void main(String[] args) {
        Thread virtualThread = Thread.ofVirtual().start(() -> { // ①
            try {
                System.out.println("Virtual thread started...");
                for (int i = 0; i < 5; i++) {
                    System.out.println("Virtual thread working: " + i);
                    Thread.sleep(1000); // 자동으로 제어권 양보
                }
                System.out.println("Virtual thread finished.");
            } catch (InterruptedException e) { // ②
                System.out.println("Virtual thread interrupted!");
                // 인터럽트에 의한 뒤처리
            }
        });

        try {
            Thread.sleep(2500); // 일정 시간동안 스레드가 계속 실행되게 한다.
        } catch (InterruptedException e) {
        }

        virtualThread.interrupt(); // ④
    }
}
-------------결과---------------
Virtual thread started...
Virtual thread working: 0
Virtual thread working: 1
Virtual thread working: 2
Virtual thread interrupted!
```

두 예제 모두 동일한 결과가 나온다.
이는 가상 스레드 인터럽트 처리도 플랫폼 스레드와 동일하게 동작한다는 사실을 보여준다.
하지만, **가상 스레드는 블로킹 연산을 만나면 불필요하게 자원을 점유하지 않고 제어권을 캐리어 스레드에게 넘겨 블로킹되지 않은 다른 가상 스레드가 실행될 수 있게 한다.**

#### 모든 가상 스레드는 단 하나의 스레드 그룹에 속한다.
모든 가상 스레드는 단 하나의 스레드 그룹에 속하며 **다른 스레드 그룹을 가진 가상 스레드를 생성하는 API는 없다.**
- `getThreadGroup()` 메서드를 호출하면 **항상 동일한 ThreadGroup 인스턴스가 반환**된다.

이를 통해 가상 스레드는 쉽게 관리할 수 있도록 다음과 같은 고유한 특성을 갖고 있다는 사실을 알 수 있다.

| 특징 | 설명 |
| ---- | ---- |
| 우선순위 | 가상 스레드의 우선순위는 `NORM_PRIORITY`로 정해진다. |
| 데몬 상태 | 모든 가상 스레드는 기본적으로 데몬 스레드로 가상 스레드에 대해 `setDaemon` 메서드를 호출해서 상태를 변경하려고 해도 아무런 효과가 없다. |
| 스레드 우선순위 | 가상 스레드에 대해 `setPriority` 메서드를 호출하더라도 우선순위는 달라지지 않는다. |
| `isVirtual` 메서드 | `Thread::isVirtual` 인스턴스 메서드는 스레드가 가상 스레드인지 판별해준다. |
| `Duration`을 사용하는 메서드 | 자바 19에서 `join(Duration)`, `sleep(Duration)` 인스턴스 메서드가 추가되어 편리하게 사용할 수 있다. |
| `threadId` 메서드 | final이 아닌 `getId()` 메서드는 사용 중단되어 final인 `threadId()` 메서드를 사용하는 것이 좋다. |

#### 가상 스레드의 사소한 제약사항
정적 메서드인 `Thread::getAllStackTraces`는 플랫폼 스레드의 스택 트레이스만 반환하고 가상 스레드의 스택 트레이스는 포함하지 않는다.
또한, **가상 스레드를 어떤 플랫폼 스레드가 실행하고 있는지 확인할 방법이 현재로서 없다**.
## 🧑‍💻 가상 스레드 생성 시연
가상 스레드를 활용하면 많은 작업을 병렬로 실행할 수 있어 자바 애플리케이션의 확장성을 높일 수 있다.
가상 스레드가 실제로 수천 개의 동시 요청을 어떻게 처리하는지 작동하는 모습을 살펴보자.

#### 👀 예시 상황: 태스크마다 새로운 스레드를 Executor를 사용해 10,000개의 태스크를 제출
```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return 1;
        });
    });
}
```

이렇게 **10,000**개의 가상 스레드를 문제 없이 동시에 실행할 수 있다.
- **JDK**가 최소한의 운영체제 스레드만으로 **10,000**개의 가상 스레드를 관리한다.

하지만 `Executors.newCachedThreadPool()` 을 사용하면 10,000개의 운영체제 스레드를 생성하면서 프로그램은 비정상 종료된다.
> **Exception in thread "main" java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached**


`Executors.newFixedThreadPool()`을 사용해 고정된 스레드 풀을 사용하면 동시성 처리 능력이 감소한다.
### 처리량과 확장성
가상 스레드는 다음 특징을 가진 애플리케이션에서 처리량을 더욱 향상할 수 있다.
1️⃣ **높은 동시 작업수**
가상 스레드는 수천 개의 요청을 동시에 처리해야 하는 웹 서버나 병렬로 많은 수의 I/O 집중 작업을 수행하는 애플리케이션에서 이상적인 효과를 볼 수 있다.

2️⃣ **CPU 집중적이지 않은 작업 부하**
가상 스레드는 CPU 집중적인 작업을 수행하는 시간보다 I/O 작업처럼 대기하는 시간이 많이 발생할 수록 유용하다.

:::callout ⚠️ **가상 스레드는 동시성 문제의 만병통치약이 아니다.**
:::callout - 수많은 동시 작업이 CPU 집중적이지 않은 작업 부하와 결합될 때 효과적이다.
### 가상 스레드 확장성의 근본 원칙
:::callout ℹ️ 리틀의 법칙
:::callout - 멀티스레드 애플리케이션을 포함한 큐잉 시스템의 성능에 대해 통찰력을 제공하는 근본 원칙
:::callout - `지연시간`, `동시성`, `처리량` 사이의 수학적 관계를 설정
:::callout - `λ(처리량) = N / d`

#### 리틀의 법칙을 구성하는 요소

| **요소** | **의미** |
| ---- | ---- |
| **처리량(λ)** | 단위 시간당 완료되는 항목(태스크, 요청 등)의 평균 수 |
| **동시성(N)** | 동시에 처리되고 있는 항목의 평균 수 |
| **응답 시간(d)** | 단일 항목이 시작부터 완료까지 처리되는 데 걸리는 평균 시간 |

#### 가상 스레드와 리틀의 법칙
전통적인 스레딩 모델에서는 동시성을 늘릴 수 없다면 지연 시간을 줄여야 하는데 I/O 집중적인 작업에서는 지연시간을 줄이는 것이 개발자의 통제 범위내에 있는 것이 아니다.
> ✅ **가상 스레드를 사용하면 더 높은 동시성(N)을 확보할 수 있어 지연시간(d)를 줄이지 않고도 처리량을 늘릴 수 있다.**

I/O 집중적인 작업을 처리하는 시나리오에서 가상 스레드의 처리량은 전통적인 스레드 풀의 처리량을 아득히 뛰어넘는다.
- 플랫폼 스레드 풀을 사용할 때 더 많은 스레드를 사용하면 처리량을 늘릴 수 있지만 한계가 있다.
- 운영체제 자원이 한정적이며 스레드 관리에 대한 부담은 병목 현상으로 이어질 수 있다.
## ↗️ 가상 스레드 내부 동작 방식
### 스택 프레임과 메모리 관리
**전통적인 스레드**는 스택 프레임을** 운영체제가 할당하는 ****`일체형(monolithic) 메모리 블록`**에 저장한다.
- 스레드에 필요한 스택 크기를 예측해야만 했다.

반면 <span class="text-red">**가상 스레드**</span>는 스택 프레임을 **`가비지 컬렉션 대상이 되는 힙`**에 저장한다.
- 스레드에 필요한 스택 크기를 예측할 필요가 없다.
- 가상 스레드의 핵심!!!
가상 스레드가 사용할 수 있는 메모리 사용 공간은 수백 바이트에서 시작해 호출 스택이 커지고 줄어듦에 따라 자동으로 조정된다. 이런 동적 메모리 관리를 통해 자원 효율성을 크게 높일 수 있다.
### 캐리어 스레드와 운영체제의 개입
운영체제는 가상 스레드의 존재를 알지 못하고 운영체제 수준의 스케줄링 단위인 플랫폼 스레드만을 인식할 수 있다.
:::callout ℹ️ **캐리어 스레드(carrier thread)**
:::callout - 자바 런타임은 코드를 가상 스레드에서 실행하기 위해 가상 스레드를 플랫폼 스레드에 **`마운트(mount)`**하는데 이때 사용되는 플랫폼 스레드를 캐리어 스레드라 부른다.
### 블로킹 연산 처리
가상 스레드가 **스레드를 블로킹하는 연산을 만나면** 캐리어 스레드로부터 **`언마운트(unmount)`**될 수 있다.
캐리어 스레드의 스택에 복사된 후 코드가 실행되면서 변경이 발생한 스택 프레임 내용이 힙으로 다시 복사되고 캐리어 스레드는 다른 작업을 수행할 수 있게 된다.
가상 스레드는 이런 블로킹 연산 처리 방식덕에 자원 효율성을 높일 수 있다.
### 투명성과 비가시성
가상 스레드를 `마운트-언마운트` 하는 과정은 투명해 자바 코드에서 보이지 않는다.
현재 어떤 **캐리어 스레드**가 가상 스레드를 마운트하여 실행하는지 코드삭에서 식별할 수 있는 방법은 없다.
- **캐리어 스레드**의 `ThreadLocal` 값도 가상 스레드에게는 보이지 않는다.
이런 높은 수준의 추상화 덕에 기존 자바 코드베이스를 변경할 필요 없이 가상 스레드를 완벽하게 사용할 수 있게 된다.
### 비동기 연산 단순화
가상 스레드를 사용하면 비동기 연산과 태스크 집계를 쉽게 할 수 있고 비동기 태스크가 종료될 때까지 기다려야 하는 블로킹 부담이 사라진다.
그래서 `Future`의 블로킹 메서드인 `get()`을 호출하더라도 성능 저하를 걱정할 필요가 없다.
그러나 **가상 스레드가 빛을 발하는 곳은 다수의 비동기 태스크 결과를 집계할 때이다.**

#### 👀 서로 다른 API에서 문장 구성요소를 가져와 하나의 문장으로 결합하는 시나리오
- 무작위로 생성되는 문장을 만들기 위해 형용사와 명사 검색이 필요
```java
public class PhraseGeneratorExample {

    public static void main(String[] args) {
        PhraseGeneratorExample phraseGeneratorExample = new PhraseGeneratorExample();
        try {
            System.out.println(phraseGeneratorExample.generatePhrase());
        } catch (ExecutionException | InterruptedException e) {
        }
    }

    public String generatePhrase() throws ExecutionException, InterruptedException {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            Future<String> adjectiveFuture = executor.submit(this::fetchAdjective);
            Future<String> nounFuture = executor.submit(this::fetchNoun);

            String adjective = adjectiveFuture.get();
            String noun = nounFuture.get();

            return adjective + " " + noun;
        }
    }

    private String fetchAdjective() { // API를 호출해 형용사 조회
        return "beautiful";
    }

    private String fetchNoun() { // API를 호출하여 명사 조회
        return "sunset";
    }
}
```

개별 태스크를 수행하는 가상 스레드를 쉽게 생성하기 위해 `VirtualThreadPerTaskExecutor`를 사용
`ExecutorService`의 `submit` 메서드를 사용해 <u>형용사를 가져오는 태스크</u>와 <u>명사를 가져오는 태스크</u> 2개의 태스크를 제출한다.
가상 스레드는 제출된 작업들이 반환되는 `Future` 객체에 대해 `get()`을 호출할 때 결과가 나올 때까지 편안하게 블로킹하고 대기하더라도 과도한 자원을 소모하거나 성능 저하를 일으키지 않는다.
### 든든한 구조적 동시성
앞선 예제는 문제없이 실행되고 동시에 실행되는 태스크를 처리하는 직관적인 방식을 보여주지만 실제로는 예외를 던질 수도 있고 타임아웃 처리가 없다면 무한히 블로킹을 할 수도 있다.
> **JEP 505**에서는 견고한 동시성 코드를 쉽게 작성할 수 있도록 <span class="text-brown">**구조적 동시성**</span>을 도입했다.
> - **구조적 동시성 API**는 **구조화된 영역(scope)**안에서 태스크를 실행하고 **태스크 중 일부가 실패하거나 타임아웃이 발생하면 해당 영역 안에 있는 모든 태스크가 자동으로 취소**되도록 설계됐다.

```java
public static void main(String[] args) {
    try (var scope = StructuredTaskScope.open()) {
        StructuredTaskScope.Subtask<String> subtask1 = 
            scope.fork(() -> fetchData("https://api1.example.com"));
        StructuredTaskScope.Subtask<String> subtask2 = 
            scope.fork(() -> fetchData("https://api2.example.com"));
        scope.join();
        var result = subtask2.get() + " " + subtask1.get();
        System.out.println(result);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
}
```

이를 통해 구조적 동시성이 적용된 영역에서 태스크를 실행하면 태스크 실행 취소와 예외 처리를 자동으로 수행해주어 개발자의 부담이 줄어든다.
또한 구조적 동시성을 적용하면 개발자의 의도를 더 깔끔하고 간결하게 드러낼 수 있는 선언적 프로그래밍 스타일의 코드를 더 쉽게 작성할 수 있다.
## 요청 제한을 통한 자원 제약 관리
가상 스레드의 긍정적인 면을 살펴봤지만 어떤 면에서는 가상 스레드 때문에 어려움을 겪을 수도 있다.
이는 소프트웨어를 구성하는 각 요소들의 부하처리 능력이 모두 동일하지 않기 때문이다.
**ex) 웹 애플리케이션은 백만개의 요청을 처리하기 위해 가상 스레드를 생성하지만 데이터베이스는 그렇게 많은 요청을 처리하지 못할 수 있다.**

🤔** 가상 스레드를 사용할 때 서비스의 과부하를 어떻게 방지해야 할지 고민해야 한다.**
이 문제를 해결하기 위해서는 접근하려는 자원에 특화된 **`요청 제한(rate-limiting) 메커니즘`**이 필요하다.
#### 👀 세마포어를 사용해 웹 서비스에 대한 동시 요청 수를 제어하는 예제
```java
public class ResourceAwareRateLimitExample {

    private static final HttpClient CLIENT = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10)) // ①
        .build();

    private static final int MAX_PARALLEL = 10; // ②
    private static final Semaphore gate = new Semaphore(MAX_PARALLEL); // ③
    private static final String API_URL =
        "https://api.chucknorris.io/jokes/random";

    public static void main(String[] args) throws Exception {
        Instant start = Instant.now();
        List<String> jokes = fetchJokes(50); // ④

        long ms = Duration.between(start, Instant.now()).toMillis();
        System.out.printf("Fetched %d jokes in %d ms (avg %d ms)%n",
            jokes.size(), ms, ms / jokes.size());

        jokes.stream().limit(3).forEach(j -> System.out.println("• " + j));
    }

    private static List<String> fetchJokes(int n) throws Exception {
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) { // ⑤
            List<Future<String>> futures = IntStream.range(0, n)
                .mapToObj(i -> pool.submit(ResourceAwareRateLimitExample::fetchJoke))
                .toList();

            return futures.stream()
                .map(ResourceAwareRateLimitExample::join) // ⑥
                .toList();
        }
    }

    private static String fetchJoke() throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(API_URL))
            .GET()
            .timeout(Duration.ofSeconds(30)) // ⑦
            .build();

        try {
            gate.acquire(); // ⑧
            HttpResponse<String> res
                = CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() != 200) {
                throw new RuntimeException("API error " + res.statusCode());
            }

            return parseJoke(res.body());
        } finally {
            gate.release(); // ⑨
        }
    }

    private static String parseJoke(String json) {
        int s = json.indexOf("\"value\":\"") + 9;
        int e = json.indexOf('"', s);
        return json.substring(s, e).replace("\\\"", "\"");
    }

    private static <T> T join(Future<T> f) {
        try {
            return f.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new CompletionException(e);
        } catch (ExecutionException e) {
            throw new CompletionException(e.getCause());
        }
    }
}
```

1️⃣ 네트워크 문제가 발생하더라도 공유해서 사용하는 HttpClient가 무한정 기다리지 않도록 타임아웃을 10초로 설정
2️⃣ 최대로 허용하는 동시 요청 개수 10개로 설정
3️⃣ 최대 동시 요청 개수를 지정해 요청 제한 역할을 하는 세마포어 생성
4️⃣ 세마포어가 동시성을 어떻게 제어하는지 살펴보도록 최대 동시 요청 개수를 초과하는 조회 요청 시도(50회)
5️⃣ 제출된 요청당 1개의 가상 스레드를 만드는 Executor 생성
6️⃣ 모든 future가 완료될 때까지 블로킹하며 완료되는 순서대로 결과를 모은다.
7️⃣ 개별 요청이 무제한으로 블로킹되지 않도록 요청당 타임아웃을 30초로 설정
8️⃣ **세마포어로부터 출입증을 획득. 모두 사용중이라면 기다려야 한다. (요청 제한 작동)**
9️⃣ 예외가 발생하더라도 출입증은 반드시 반납 (finally 블록)

세마포어를 통해 10개의 동시 요청이 이미 처리되는 중이라면 새로운 요청은 먼저 처리중인 요청이 완료될 때까지 기다려야 한다. 
<span class="text-red">**자원 효율성이 떨어질 거라고 예상되지만 가상 스레드에서는 블로킹이 발생해도 자원 효율성이 떨어지지 않는다!!**</span>
### 자바의 세마포어 이해
:::callout 💡 **세마포어 (semaphore)**
:::callout - 공유 자원에 대한 접근을 통제하는 동기화 메커니즘
:::callout - `java.util.concurrent` 패키지의 `Semaphore` 클래스 사용
:::callout - 정해진 출입증을 관리

실제 운영 시스템에서는 **자원 사용량을 모니터링하고 타임아웃을 구현하여 무기한 블로킹을 막는 것이 좋다.**
### 세마포어를 사용하는 이유

| **목적** | **설명** | **예시** |
| ---- | ---- | ---- |
| **자원 관리** | 모든 유형의 공유 자원에 대한 접근 한도를 엄격하게 제한하는 데 이상적이다. | 애플리케이션이 **10개의 DB 연결 라이선스**만 보유하고 있을 때 동시 연결이 이 제한을 초과하지 않도록 보장. |
| 요청 제한 | 웹 서비스 또는 API에 대한 요청 속도를 제어하여 과부하를 방지하고 원활한 사용자 경험을 보장 | 분당 100개 요청만 허용하는 외부 API 호출 시 **1분 주기로 100개의 출입증을 보충하는 스케줄러**와 세마포어를 결합하여 요청 제한을 준수 |
| 일반적인 동시성 제어 | 특정 코드 섹션을 동시에 실행하는 스레드의 수를 정밀하게 관리할 수 있다. |  |


**세마포어를 사용할 때 아래 중요 사항들을 염두해야 한다.**

| 사항 | 특징 | 설명 및 유의점 |
| ---- | ---- | ---- |
| 공정성 | 자바의 `Semaphore` 클래스는 공정성을 설정할 수 있다. 공정한 세마포어에서는 출입증이 **요청한 순서**대로 부여된다. | 요청 순서를 유지하는 오버헤드로 인해 성능이 약간 떨어질 수 있다. 따라서 스레드 고갈이 발생하지 않도록 막는 것이 성능보다 중요할 때 공정성을 선택한다. |
| 블로킹 | 사용 가능한 출입증이 없을 경우 스레드를 블로킹할 수 있다. | 가상 스레드는 블로킹되더라도 운영체제 자원을 소모하지 않아 세마포어 기반 동기화의 확장성이 훨씬 좋아질 수 있다. |
| 오류 처리 | finally 블록에서 출입증을 반납해야 한다. | 예외가 발생하는 경우에도 자원 누수를 방지하고 적절한 자원 관리를 보장하는데 필수이다. |
| 출입증 관리 | 세마포어는 출입증을 특정 스레드와 연결하지 않는다. | 출입증을 획득하지 못한 스레드도 `semaphore.release()`를 호출할 수 있다.  |

#### 세마포어의 한계
세마포어는 제한된 자원을 보호하는데 필수지만 위험도 있다.
- 어떤 스레드가 어느 출입증을 획득했는지 추적하지 않는다.
- 출입증을 획득하지 못한 스레드도 출입증을 반납할 수 있다.
```java
// 2개의 출입증
Semaphore semaphore = new Semaphore(2);

// 스레드1: 실수로 출입증 반납하지 않음.
Thread.ofVirtual().start(() -> {
    semaphore.acquire();
});

// 스레드2: 받지 않은 출입증을 반납
Thread.ofVirtual().start(() -> {
    semaphore.release(); // 버그
    semaphore.release(); // 이중 버그
});

결과: 출입증이 3개가 되었음. release()를 더 호출하면 더 늘어날 수 있음.
```

이런 문제는 운영환경에서 데이터베이스 연결 초과, API 과부하, 메모리 고갈등으로 이어질 수 있다.
## ⚠️ 가상 스레드의 한계
가상 스레드는 <span class="text-red">**고정(pinning)**</span>이라고 알려진 제약사항도 있고 이로인해 잠재적으로 애플리케이션 확장성과 성능에 좋지 않은 영향을 줄 수 있다.
:::callout ⚠️ **가상 스레드 맥락에서의 고정(pinning)**
:::callout 가상 스레드가 자신의 캐리어 스레드에 묶여 고정되는 상황
:::callout - 고정된 상태의 가상 스레드는 블로킹 연산을 실행할 때 언마운트 할 수 없고 고정되어 있는 동안 해당 캐리어 스레드를 독점적으로 점유하게 된다.

#### 고정이 발생하는 2가지 시나리오

| **상황** | **설명** |
| ---- | ---- |
| **`synchronized`**** 블록 or 메서드** | 가상 스레드는 synchronized가 붙은 블록이나 메서드에 진입할 때 캐리어 스레드에 고정된다. |
| **네이티브 메서드 or 외부 함수** | 네이티브 메서드나 외부 함수(Foreign Function)를 실행할 때도 고정된다. |

#### 고정의 문제
1️⃣ **처리량 감소**
- 고정된 가상 스레드가 캐리어 스레드를 점유해 그만큼 사용 가능한 캐리어의 수가 줄어든다.
- 다른 가상 스레드는 사용 가능한 캐리어 스레드를 더 오래 기다리게 되어 전반적인 처리량이 떨어진다.

2️⃣ **자원 비효율성**
- 캐리어 스레드는 시스템 명세에 묶여있는 유한한 자원이다.
- 캐리어 스레드가 블로킹되어 다른 태스크를 실행하지 못하고 기다려야 하면 자원 사용 효율성이 떨어진다.

3️⃣ **확장성 문제**
- `synchronized` 블록 또는 네이티브 메서드의 빈번한 사용으로 고정된다면 확장성 문제에 직면할 수 있다.

:::callout 💡 **고정의 영향을 완화시키는 전략**
:::callout - `synchronized` 블록 대신 `java.util.concurrent.locks `패키지의 `ReentrantLock`을 사용하면 가상 스레드가 블로킹 발생시 언마운트 된다.
:::callout - 정기적으로 코드를 검토하여 `synchronized` 메서드나 블록, 네이티브 메서드의 사용을 식별하고 최소화한다.

:::callout 💡 **JDK 24에서의 ****`synchronized`**** 블록**
:::callout **JDK 24**에서는 `synchronized` 블록안에서도 가상 스레드가 고정되지 않는다.
:::callout JVM이 `synchronized` 영역에서의 언마운트도 지원하여 `synchronized` 으로 인해 발생하는 고정 현상 제약도 **JDK 24**부터는 사라진다.
### ReentrantLock으로 고정 문제 해결하기
**`ReentrantLock`**은 자바의 동기화 메커니즘으로 전통적인 `synchronized` 블록보다 더 유연하고 정교한 스레드 상호작용을 허용하며 `공정성`, `잠금 시도(try-lock)`, `인터럽트 가능성`과 같은 추가 기능을 제공한다.
- <span class="text-blue">가상 스레드 고정 문제를 피할 수 있다!!!</span>

**`ReentrantLock`**** 을 사용해 고정문제를 회피하는 방법 예제코드**
```java
public class PreventPinningExample {

    private static final ReentrantLock lock = new ReentrantLock(); // ①

    public static void main(String[] args) {
        var threadList = IntStream.range(0, 10)
                .mapToObj(i -> Thread.ofVirtual().unstarted(() -> {
                    if (i == 0) {
                        System.out.println(Thread.currentThread()); // ②
                    }

                    lock.lock(); // ②
                    try {
                        Thread.sleep(25); // ③
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        lock.unlock(); // ④
                    }

                    if (i == 0) {
                        System.out.println(Thread.currentThread());
                    }
                })).toList();

        threadList.forEach(Thread::start);
        threadList.forEach(thread -> {
            try {
                thread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
}
```

#### synchronized 블록을 사용했던 버전과 차이점
1. <span class="text-blue">**ReentrantLock**</span>은 `synchronized` 블록과 마찬가지로 상호 배제 효과를 내지만 `synchronized` 블록과 달리 고정 현상을 유발하지 않아 가상 스레드 친화적이다.
2. lock() 메서드는 락을 획득하여 `synchronized` 블록에 진입한것과 비슷한 효과를 내지만 가상 스레드를 고정하지 않는다.
3. 락을 획득한 채로 sleep 메서드를 실행하는 동안 가상 스레드는 캐리어 스레드로부터 언마운트 된다.
4. unlock 메서드는 finally 블록안에서 호출하여 락 반납을 보장하여 데드락 발생을 예방한다.

#### 🤔 ReentrantLock은 고정 문제를 어떻게 피할까?
`synchronized` 블록이 가상 스레드 고정을 유발하는 객체 모니터를 사용하는 반면 `ReentrantLock`은 가상 스레드를 인지할 수 있는 <u>**파킹/언파킹 메커니즘**</u>을 사용한다.
:::callout ℹ️ **파킹/언파킹 메커니즘(park/unpark mechanism)**
:::callout - 자바의 저수준 스레드 조정 기본 방식
:::callout - 스레드가 `LockSupport.park()` 호출하면 다음 상황이 발생할 때 까지 해당 스레드는 파킹(블로킹)된다.
:::callout   - 다른 스레드가 해당 스레드를 대상으로 unpark() 호출할 때
:::callout   - 해당 스레드가 인터럽트될 때
:::callout   - 호출이 허위로 반환될 때 (드물게 발생할 수 있다.)
:::callout - `LockSupport.unpark(thread)`를 호출하면 대상 스레드가 파킹 상태에서 깨어나 다시 진행할 수 있는 상태가 된다.
> **JVM은 가상 스레드가 언제 파킹되는지 감지할 수 있고 파킹을 감지하면 캐리어 스레드로부터 가상 스레드를 언마운트할 수 있다.**

**가상 스레드가 ****`ReentrantLock`****이 적용되는 영역에서 블로킹되면 자바 런타임은 아래와 같이 동작한다.**
1. 가상 스레드의 상태를 저장
2. 가상 스레드를 캐리어 스레드로부터 언마운트한다.
3. 다른 가상 스레드를 캐리어 스레드에 마운트한다.
4. 나중에 락이 반납되면 언마운트된 가상 스레드를 사용 가능한 임의의 캐리어 스레드에 마운트한다.

### 네이티브 메서드 호출과 고정
> 🤔** 네이티브 메서드 호출은 어떻게 가상 스레드 고정을 유발할까?**
> **JVM**이 네이티브 코드 실행을 검사하거나 제어할 수 없기 때문에 가상 스레드가 네이티브 메서드를 호출하면 고정된다.

네이티브 코드는 <u>스레드 간 마이그레이션될 수 없는 스레드 로컬 상태를 가질 수 있으며</u>, 네이티브 호출 스택은 <u>자바 스택 프레임처럼 저장하고 복원할 수 없고</u> 네이티브 코드는 <u>운영체제 수준의 스레드 기본 요소와 직접 상호작용할 수 있다</u>.
이런 여러 제약사항 때문에 가상 스레드는 네이티브 호출 전체 구간동안 자신의 캐리어 스레드에 마운트된 상태를 강제로 유지하게 된다.
## 가상 스레드에서 ThreadLocal 변수의 문제
<span class="text-blue">**ThreadLocal**</span> 클래스를 사용하면 변수를 생성한 스레드만 읽고 쓸 수 있는 변수를 만들 수 있다.
덕분에 여러 스레드가 동시에 동일한 데이터에 접근하려고 시도하는 경우 **ThreadLocal**을 사용하면 동기화를 사용할 필요가 없어진다.

#### ThreadLocal의 사용 사례
1️⃣ **자원 격리**
ThreadLocal 변수는 스레드 안전하지 않은 자원을 저장하는 역할을 수행한다.

2️⃣ **암묵적 컨텍스트**
ThreadLocal 변수는 데이터베이스 연결, 사용자 세션 데이터, 트랜잭션 ID와 같이 스레드가 수행하는 태스크와 관련된 컨텍스트 정보를 저장하는데 사용된다.

### 가상 스레드의 도전 과제
수백만 개의 가상 스레드에서 ThreadLocal 변수를 과도하게 사용하면 문제가 생길 수 있다.

| **문제** | **설명** |
| ---- | ---- |
| **메모리 소비** | 가상 스레드가 저마다 ThreadLocal 변수의 복사본을 가지면 데이터의 크기가 클 수록 메모리 사용량이 급격히 증가할 수 있다. |
| **오버헤드** | ThreadLocal 변수를 초기화하고 정리하는데 오버헤드가 따른다. 많은 양의 가상 스레드는 이런 오버헤드가 성능에 부담이 될 수 있다. |
| **상속** | 가상 스레드는 전통적인 스레드처럼 부모 스레드로부터 ThreadLocal 값을 상속받는다. 이 상속은 추적과 디버깅을 어렵게 만드는 버그를 유발할 수 있다. |

#### ThreadLocal 의 대안
1️⃣ **스코프드 밸류 (Scoped Value)**
스코프드 밸류는 가상 스레드를 염두에 두고 설계됐다.
**스코프드 밸류의 불변성과 제한된 수명**은 스레드 사이에서 안전하고 효율적으로 데이터를 주고받는 데 매우 적합하다.

2️⃣ **공유에 대한 재검토**
ThreadLocal의 필요성을 최소화하도록 애플리케이션을 재구성할 수 있는지 탐색해 확장성을 더 개선할 수 있는 설계한다.
## 🖥️ 모니터링
가상 스레드의 한계를 살펴보니 문제의 출발점은 2가지이다.
- 고정
- ThreadLocal
이런 문제점을 염두하고 애플리케이션을 만드는 것도 방법이지만 레거시 애플리케이션을 다뤄야 할 때도 있다. 이런 상황에서는 숨져진 문제를 드러내 인지할 수 있게 도와주는 도구들이 있다.
### ThreadLocal 모니터링
ThreadLocal을 추적하려면 `-Djdk.traceVirtualThreadLocals` 플래그를 사용해 JVM을 시작해야 한다.
- 가상 스레드 안에서 ThreadLocal 변수가 사용될 때마다 스택 트레이스를 출력해 잠재적인 오용이나 과도한 사용을 알려준다.
### 가상 스레드 고정 현상 모니터링
소스 코드에서 발생하는 고정 문제 역시 모니터링할 수 있다.
- `JVM 플래그`
- `JDK Flight Recorder`(JDK 플라이트 레코더, JFR)
- 스레드 덤프를 생성할 수 있는 `jcmd`
#### 🔍 JVM 플래그 사용
시스템 프로퍼티인 `jdk.tracePinnedThreads`는 스레드가 고정된 상태에서 블로킹 작업을 만날 때 스택 트레이스를 남기도록 설계되었다.
- `-Djdk.tracePinnedThreads=full` : 전체 스택 트레이스를 출력하며 모니터를 보유하고 있는 자바 프레임과 네이티브 프레임도 강조되어 포함된다.
- `-Djdk.tracePinnedThreads=short` : 트레이스 범위를 문제 있는 프레임으로 제한할 수 있다.

스택 트레이스를 분석해 문제가 되는 코드 위치를 알 수 있고 스레드 사용을 최적화하고 고정 현상 발생을 최소화하는 데 필요한 합리적인 정보 기반 결정을 내릴 수 있다.
#### 🔍 JDK 플라이트 레코더 활용하기
**JDK 플라이트 레코더**는 전통적인 모니터링을 넘어 가상 스레드의 미묘한 차이를 관찰하고 디버깅하는 데 특화된 기능을 갖고 있는 소중한 도구이다.

| 이벤트 | 설명 |  |
| ---- | ---- | ---- |
| `jdk.VirtualThreadStart` 및 `jdk.VirtualThreadEnd` 이벤트 | 가상 스레드의 생성과 종료를 표시 | 기본적으로 활성화되어 있지 않지만 활성화하면 스레드 생애주기를 추적할 수 있다. |
| `jdk.VirtualThreadPinned` | 가상 스레드가 고정되어 캐리어 스레드를 놓아주지 못하고 점유하고 있을 때 이 이벤트가 발생한다. | 기본적으로 활성화되어 있다. 기본적으로 20밀리초 이상 고정 및 점유하면 신호를 보내며 임곗값은 지정할 수 있다. |
| jdk.VirtualThreadSubmitFailed | 가상 스레드를 시작하거나 언파킹하는 데 실패했을 때 신호를 보낸다. | 기본적으로 활성화되어 있다. JVM의 스레드 관리 내부에서 발생하는 자원 고갈이나 예상치 못한 병목 현상이 발생했음을 의미한다. |

#### jcmd 스레드 덤프에서 가상 스레드 확인
`jcmd` 유틸리티를 사용하면 <u>**가상 스레드 관련 정보도 포함된 스레드 덤프**</u>를 생성할 수 있다.
스레드 덤프를 생성하려면 실행중인 자바 애플리케이션의 프로세스 ID를 알아야 한다.

> `jcmd` 명령의 `format` 옵션으로 스레드 덤프의 형식을 지정할 수 있다.

```bash
# 일반 텍스트
jcmd <PID> Thread.dump_to_file -format=text <file>

# JSON
jcmd <PID> Thread.dump_to_file -format=json <file>
```


`jcmd` 스레드 덤프는 `ExecutorService` 인터페이스에 의해 생성되어 **네트워크 I/O 연산에 의해 블로킹된 가상 스레드를 나열한다**. 하지만 다음 정보는 포함되지 않는다는 <span class="text-red">**한계**</span>도 있다.
- 객체 주소
- 락
- 자바 네이티브 인터페이스(JNI) 통계
- 힙 통계
- 그 외 전통적인 스레드 덤프에 공통적으로 포함되는 정보

#### 스레드 덤프를 생성하는 프로그램
`jcmd` 같은 명령행 도구 외에 자바 애플리케이션 안에서 프로그램 방식으로도 스레드 덤프를 생성할 수 있다.

> 자바의 `ProcessBuilder`를 사용해 프로그램 방식으로 스레드 덤프를 유발하고 포착하는 방법

```java
public class ThreadDumpDemo {

  private static final int THREAD_COUNT = 1_000;
  private static final Duration WORK_DURATION = Duration.ofSeconds(5);
  private static final Duration DELAY_BEFORE_DUMP = Duration.ofSeconds(2);

  public static void main(String[] args) {
    long pid = ProcessHandle.current().pid(); // ①
    String outputFile = "dump.json";

    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {

      IntStream.range(0, THREAD_COUNT).forEach(i -> executor.submit(() -> sleep(WORK_DURATION))); // ②

      executor.submit(() -> {
        sleep(DELAY_BEFORE_DUMP); // ③
        runJcmdDump(pid, outputFile);
      });
    }
  }
  
  private static void sleep(Duration d) {
    try {
      TimeUnit.NANOSECONDS.sleep(d.toNanos());
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  private static void runJcmdDump(long pid, String file) {
    if (!new File(file).isAbsolute()) {
      throw new IllegalArgumentException("Output path must be absolute.");
    }
    ProcessBuilder pb = new ProcessBuilder(List.of(
        "/bin/sh", "-c",
        String.format("jcmd %d Thread.dump_to_file -format=json %s",
            pid, file))); // ④
    try {
      Process p = pb.start();
      int exit = p.waitFor();
      if (exit != 0) {
        System.err.printf("jcmd exited %d%n", exit);
        p.getInputStream().transferTo(System.err);
        p.getErrorStream().transferTo(System.err);
      }
    } catch (IOException | InterruptedException e) {
      Thread.currentThread().interrupt();
      System.err.println("Failed to run jcmd: " + e.getMessage());
    }
  }
}
```

1️⃣ **ProcessHandle** **API**를 사용해 현재 **PID**를 얻는다.
2️⃣ 1,000개의 가상 스레드를 생성하고 5초동안 sleep
- 덤프를 얻을 때 많은 활성 스레드가 존재하도록 보장하여 동시성 작업 부하가 큰 상황을 시뮬레이션
3️⃣ 스레드 덤프는 2초 지연 후에 유발
- 시스템 상태를 포착할 때 대부분의 가상 스레드가 활성(또는 sleep)상태임을 보장
4️⃣ **ProcessBuilder**를 사용해 JSON 출력 형식으로 jcmd 명령을 실행
## 🤖 HotSpotDiagnosticMXBean으로 스레드 덤프 생성
자바 관리 확장 기능(JMX)에는 애플리케이션 모니터링에 사용할 수 있는 강력한 도구들이 포함되어 있다
**HotSpotDiagnosticMXBean**에 스레드 덤프의 형식을 지정할 수 있는 새로운 메서드가 추가됐다.
```java
public static void takeThreadDump(String outputFile) {
    var hotSpotDiagnosticMXBean
        = ManagementFactory.getPlatformMXBean(HotSpotDiagnosticMXBean.class);
    try {
      // Ensure that the output file path is absolute
      if (!new File(outputFile).isAbsolute()) {
        throw new IllegalArgumentException("Output path must be absolute.");
      }
      hotSpotDiagnosticMXBean.dumpThreads(outputFile,
          HotSpotDiagnosticMXBean.ThreadDumpFormat.JSON);
    } catch (IOException e) {
      throw new RuntimeException("An error occurred while taking thread dump", e);
    }
  }
```

## 💡 가상 스레드 마이그레이션 요령
가상 스레드로 마이그레이션할 때 필요한 요령을 정리하면 다음과 같다.

| **요령** | **설명** |
| ---- | ---- |
| **라이브러리 업데이트가 핵심** | 가상 스레드에서 고정 문제를 피하는 가장 좋은 방법은 가상 스레드용으로 업데이트된 라이브러리를 사용하는 것이다. |
| **업데이트된 라이브러리가 없을 때** | 라이브러리를 업데이트할 수 없다면 기존의 블로킹 I/O나 코드를 `Executors.newFixedThreadPool()` 같은 스레드 풀로 옮기는 것이 좋다. |
| **세마포어의 딜레마** | 고정 현상이 발생할 수 있는 구역에 동시에 진입할 수 있는 가상 스레드 개수를 제한할 수 있다. 하지만 너무 낮게 설정하면 동시성이 떨어져 가상 스레드의 장점이 사라질 수 있다. |
| **에코시스템의 변화** | 많은 라이브러리가 아직 가상 스레드에 완전히 대응하지 못하고 있으니 정기적으로 업데이트를 확인해야 한다. |
| 자원의 균형 | 훨씬 많은 작업을 동시에 실행할 수 있게 하지만 CPU나 메모리 같은 자원에서 병목이 발생할 수 있다. |
| 프레임워크 이해 | 사용중인 프레임워크나 언어가 가상 스레드를 어떻게 지원하는지 알아야 한다. |

⚠️ **가상 스레드를 도입하면 다음 지표들을 주의깊게 관찰해야 한다.**

| **지표** | **설명** |
| ---- | ---- |
| **CPU** | 확장성이 잘 나오는지 확인하기 위해서 CPU 사용 패턴을 추적해야 한다. |
| **메모리와 가비지 컬렉션** | 가상 스레드는 메모리 사용 패턴을 변화시킬 수 있으므로 힙 크기나 가비지 컬렉션 설정을 필요시 조정해야 한다. |
| **지연시간과 처리량 **⭐ | 응답 속도가 실제로 빨라졌는지 부하 상황에서도 더 많은 요청을 처리할 수 있는지를 확인해야 한다. |

### 가상 스레드 장점 돌아보기

| **장점** | **설명** |
| ---- | ---- |
| **단순한 동시성** | 가상 스레드는 동시성 코드를 작성하는 방식을 근본적으로 단순화한다. |
| **향상된 확장성** | 운영체제 스레드가 가진 자원 한계에 도달하지 않고도 더 많은 수준의 동시 요청을 처리할 수 있다. |
| **효율적인 자원 사용** | 가상 스레드는 메모리를 최소한으로만 사용해 JVM이 지능적으로 스케줄링한다. |
| **높은 호환성** | 기존 자바 패러다임과 자연스럽게 통합될 수 있다. |
| **CPU 부하 감소** | I/O 대기 중일 때 CPU 시간을 직접 점유하지 않아 더 많은 CPU 자원을 필요한 곳에 쓸 수 있다. |
| **효율적인 서버 프로그래밍** | 가상 스레드를 통해 훨씬 확장성 있고 효율적인 서버 구조로 발전할 수 있다. |

### 핵심은 확장성이다.
가상 스레드는 매우 가벼워 수천개, 수백만 개까지 동시에 실행할 수 있다. 
그리고 I/O 대기 중에는 캐리어 스레드에서 자연스럽게 분리되어 메모리를 아낀다.
덕분에 시스템에 훨씬 더 많은 작업을 동시에 처리할 수 있다.
## 📚 Ref.
<span class="inline-link" data-url="https://product.kyobobook.co.kr/detail/S000219305989" data-domain="product.kyobobook.co.kr"></span>

