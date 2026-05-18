---
id: "364d67b9-9e80-803a-b3fa-feb0db747f1d"
title: "JVM & Runtime Data Area "
slug: "jvm-runtime-data-area"
category: "개발"
tags: ["JVM","Runtime Data Area"]
date: "2026-05-18"
createdAt: "2026-05-18T06:29:00.000Z"
excerpt: "JVM Architecture & Runtime Data Area 핵심 개념 요약 JVM(Java Virtual Machine)은 자바 바이트코드를 운영체제에 맞게 해석하고 실행하..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F44e01968-9f37-4b81-aa91-a7f8edddd403%2Fimage.png?table=block&id=364d67b9-9e80-80d1-a57f-ce3bd6761757&cache=v2"
groupId: "364d67b9-9e80-8029-8cab-f5b0a3f733f3"
groupSlug: "java"
lastEdited: "2026-05-18T06:43:00.000Z"
---

## JVM Architecture & Runtime Data Area
### 핵심 개념 요약
**JVM(Java Virtual Machine)**은 자바 바이트코드를 운영체제에 맞게 해석하고 실행하는 가상의 컴퓨터이며 **Runtime Data Area**는 이 JVM이 프로그램을 실행하기 위해 OS로부터 할당받는 메모리 공간입니다.
이를 통해 자바는 운영체제에 종속되지 않는 <span class="text-red">플랫폼 독립성</span>을 확보하고 가비지 컬렉터(GC)를 통한 <span class="text-red">자동 메모리 관리</span>로 **개발자가 비즈니스 로직에 집중할 수 있는 환경을 제공합니다.**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F44e01968-9f37-4b81-aa91-a7f8edddd403%2Fimage.png?table=block&id=364d67b9-9e80-80d1-a57f-ce3bd6761757&cache=v2" alt="image" width="1154" height="1010" loading="lazy" />

**`JVM Runtime Data Area`**는 데이터를 저장하고 관리하는 공간입니다.
크게 5가지 영역으로 나뉘고 <span class="text-red">**모든 스레드가 공유하는 영역**</span>과 <span class="text-blue">**스레드마다 개별적으로 존재하는 영역**</span>으로 구분됩니다.
## JVM
> **"Write Once, Run Anywhere"** - Java의 핵심 철학

JVM(Java Virtual Machine)은 Java 바이트코드를 실행하는 **가상 머신**입니다.
Java 프로그램은 OS에 직접 실행되지 않고 JVM 위에서 실행되기 때문에 **플랫폼 독립성**을 가집니다.
### JVM 실행 흐름
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F88ff8fff-fb14-4014-acbd-8c4b4df2080b%2Fimage.png?table=block&id=364d67b9-9e80-80b6-8dd0-d770e77a4d5a&cache=v2" alt="image" width="1652" height="1452" loading="lazy" />

클래스 로더가 `.class` 파일을 읽어 메모리(**Runtime Data Area**)에 적재하면 실행 엔진(**Execution Engine**)이 인터프리터와 JIT 컴파일러를 적절히 혼합하여 네이티브 코드로 변환 후 실행합니다.
👀 **단계별 정리**

| **단계** | **담당** | **설명** |
| ---- | ---- | ---- |
| **소스 코드 작성** | 개발자 | `.java` 파일 작성 |
| **컴파일** | `javac` | `.java` → `.class` (바이트코드) 변환. OS에 종속되지 않은 중간 코드 생성 |
| **클래스 로딩** | Class Loader | `.class` 파일을 JVM 메모리(Method Area)에 로드 |
| **바이트코드 검증** | Bytecode Verifier | 보안 및 유효성 검사 |
| **실행** | Execution Engine | 인터프리터 또는 JIT 컴파일러로 바이트코드를 네이티브 코드로 변환 후 실행 |

### 인터프리터 vs JIT 컴파일러
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2Fb95798bd-a090-46e1-897c-e2186b2271c2%2Fimage.png?table=block&id=364d67b9-9e80-8059-b9fc-db9f21b65d02&cache=v2" alt="image" width="1956" height="1162" loading="lazy" />

초기 자바는 한 줄씩 해석하는 인터프리터 방식만 사용하여 느린 단점이 이었습니다. 현재의 JVM은 이를 극복하기 위해 하이브리드 방식을 사용하고 있습니다.
> 바이트코드 명령어를 한 줄씩 읽어 네이티브 기계어로 번역한 후 즉시 실행합니다.


| **장 / 단점** | **설명** |
| ---- | ---- |
| **장점** | 컴파일 단계를 거치지 않아 초기 실행 속도가 빠릅니다. |
| **단점** | 동일한 메서드가 반복 호출되어도 매번 새롭게 번역해 런타임 성능이 떨어집니다. |

> 인터프리터가 실행하는 코드 중 자주 실행되는 `핫스팟`을 감지합니다.
> - 이 부분의 바이트코드 전체를 컴파일하여 네이티브 기계어로 바꾸어 버립니다.


| **장 / 단점** | **설명** |
| ---- | ---- |
| **장점** | 한 번 기계어로 바뀐 코드는 Execution Engine 내부의 **Code Cache** 영역에 저장되어 인터프리터 거치지 않고 CPU가 직접 실행하므로 **반복 실행 시 빠른 속도를 냅니다**. |
| **단점** | 초기 컴파일 비용이 발생합니다. |

**`Java 8`**부터 런타임 효율을 위해서 다단계별 최적화를 수행합니다.

| **레벨** | **명칭** | **설명** | **특징** |
| ---- | ---- | ---- | ---- |
| **0** | **Interpreter** | 프로그램이 처음 실행 시바이트코드 명령어를 한 줄씩 읽어 기계어로 번역해 실행합니다. | 컴파일 대기 시간 없이 즉시 실행되지만, 실행 속도는 가장 느립니다. 실행되면서 코드의 호출 횟수 등 프로파일링 정보를 수집 |
| **1** | **C1 단순 컴파일 (Client)** | 프로파일링 없이 C1 컴파일러가 빠르게 기계어로 변환합니다.  | 최적화 작업이 거의 없어 컴파일 시간이 매우 짧습니다. 주로 덜 중요한 코드나 시작 직후 빠르게 처리해야 하는 코드에 적용 |
| **2** | **C1 제한된 프로파일링 (Client)** | C1 컴파일러가 약간의 최적화와 함께 메서드 호출 횟수 등의 필수 프로파일링 정보를 기록하며 컴파일합니다. |  |
| **3** | **C1 전체 프로파일링 (Client)** | 수집된 데이터를 바탕으로 빠르게 기계어로 컴파일합니다. (컴파일 속도 빠름, 최적화 수준 낮음) |  |
| **4** | **C2 최대 최적화 (Server)** | 완전히 핫스팟으로 판단된 코드를 대상으로 루프 풀기, 인라이닝 등 고도의 최적화를 적용합니다. | 컴파일에 시간이 걸리지만, 완성된 기계어는 가장 빠릅니다. 이 코드는 **코드 캐시(Code Cache)**에 저장되어 재사용 |

## Runtime Data Area 구조
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F0ec49f02-ce2e-4610-80dc-b9eb733dc855%2Fimage.png?table=block&id=364d67b9-9e80-8033-9e91-f4e22d879d4d&cache=v2" alt="image" width="2084" height="1280" loading="lazy" />


| **영역** | **설명** |
| ---- | ---- |
| **Method Area** | 클래스 구조, static 데이터 저장 |
| **Heap** | 객체 인스턴스와 배열 저장 (GC 대상) |
| **JVM Stack** | 스레드별로 메소드 호출 시 프레임 생성  |
| **PC Register** | 스레드 별로 현재 실행 중인 명령어 주소 저장 |
| **Native Method Stack** | 스레드별 네이티브 메소드 실행 스택  |

### 메소드 영역 (Method Area)
> JVM이 읽어 들인 클래스와 인터페이스의 구조적 메타데이터를 보관합니다.


| **저장 내용** | **설명 / 예시** |
| ---- | ---- |
| **클래스 메타데이터** | 클래스 이름, 부모 클래스 이름, 접근 제어자, 인터페이스 정보 등 |
| **`static`**** 변수** |  |
| **Method & Field 데이터** | 메서드 이름, 반환 타입, 매개변수 정보 및 필드 정보. |
| **Runtime Constant Pool** | 클래스 파일 내부에 위치한 상수 풀이 메모리에 로드된 형태로 메서드나 필드의 실제 물리적 메모리 주소로 연결되는 심볼릭 레퍼런스(Symbolic Reference) 및 상수 저장 공간 |

✅ Java 8 이후 Method Area는 **Metaspace**로 대체되었으며 JVM 힙이 아닌 OS가 관리하는 **Native 메모리**에 위치합니다.
### 힙 영역 (Heap Area)
> 애플리케이션 내에서 `new` 연산자로 생성된 모든 객체 인스턴스와 배열이 저장되는 공간

<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F2e95c093-af35-4d48-8568-b4915331c645%2Fimage.png?table=block&id=364d67b9-9e80-80b8-89b4-e05ffc80f979&cache=v2" alt="image" width="1966" height="596" loading="lazy" />

### JVM 스택 (JVM Stack)
> 스레드 실행 흐름을 기록하며 메서드가 호출될 때마다 하나의 스택 프레임(Stack Frame)이 쌓이고 종료되면 제거(pop)됩니다.

**저장 내용:** 지역 변수, 매개 변수, 참조 변수(객체의 주소값), 반환값, 연산 중간값
### PC Register (Program Counter Register)
> 현재 스레드가 **실행 중인 JVM 바이트코드 명령어의 주소**를 가리키는 포인터입니다.

멀티스레드 환경에서 CPU 스케줄링에 의해 `Context Switching`이 일어날 때 다시 제자리로 돌아와 작업을 이어가기 위해 스레드마다 독립적으로 존재해야 합니다.
### Native 메소드 스택 (Native Method Stack)
> 자바 바이트코드가 아닌 OS 레벨이나 `C/C++`로 작성된 네이티브 코드(`JNI - Java Native Interface`를 통해 호출되는 코드)를 실행할 때 사용하는 메모리 공간입니다.

👀 **사용 예시**
```java
// 대표적인 native 메소드들
Thread.sleep(1000);          // OS 타이머에 직접 접근
System.currentTimeMillis();  // OS 시스템 시간 조회
Object.hashCode();           // 메모리 주소 기반 해시
```


## 📚 Ref.
<span class="inline-link" data-url="https://inpa.tistory.com/entry/JAVA-%E2%98%95-JVM-%EB%82%B4%EB%B6%80-%EA%B5%AC%EC%A1%B0-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%98%81%EC%97%AD-%EC%8B%AC%ED%99%94%ED%8E%B8" data-domain="inpa.tistory.com"></span>
<span class="inline-link" data-url="https://medium.com/webeveloper/jvm-java-virtual-machine-architecture-94b914e93d86" data-domain="medium.com"></span>
