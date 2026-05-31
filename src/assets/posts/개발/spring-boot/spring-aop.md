---
id: "371d67b9-9e80-80ca-9f10-d109e48beee6"
title: "Spring AOP"
slug: "spring-aop"
category: "개발"
tags: ["AOP"]
date: "2026-05-31"
dateEnd: ""
createdAt: "2026-05-31T15:59:00.000Z"
excerpt: "⭐ AOP(Aspect-Oriented Programming, 관점 지향 프로그래밍) :::callout ℹ️ AOP :::callout 핵심 비즈니스 로직과 공통(횡단) 관심사를..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F7bfa69f7-77ba-4fe2-a7a5-1ae5da1d38c0%2Fimage.png?table=block&id=371d67b9-9e80-800a-8318-f35472a3a222&cache=v2"
groupId: "36fd67b9-9e80-80ae-a9ff-d6264af85293"
groupSlug: "spring-boot"
lastEdited: "2026-05-31T15:59:00.000Z"
---

## ⭐ AOP(Aspect-Oriented Programming, 관점 지향 프로그래밍)
:::callout ℹ️** AOP**
:::callout 핵심 비즈니스 로직과 **공통(횡단) 관심사**를 분리하여 코드 중복을 제거하고 재사용성, 유지보수성을 높이는 프로그래밍 패러다임입니다.


| 구분 | 예시 |
| ---- | ---- |
| **핵심 비즈니스 로직** | 주문 처리, 상품 조회, 결제 등 서비스의 핵심 기능 |
| **공통 관심사 (부가 기능)** | 로깅, 트랜잭션, 보안, 성능 측정 등 여러 계층에 걸쳐 반복적으로 나타나는 기능 |

### AOP는 왜 필요할까?
메서드 실행 시간을 측정하는 로깅 코드와 트랜잭션 코드를 비즈니스 로직 안에 직접 삽입하는 경우를 생각해봅시다. 아래와 같은 코드가 작성됩니다.
```java
public void transferMoney(String fromId, String toId, int amount) {
    // [부가 기능] 실행 시간 측정 시작 & 로깅
    long startTime = System.currentTimeMillis();
    log.info("계좌 이체 시작");
    
    // [부가 기능] 데이터베이스 트랜잭션 시작
    transactionManager.begin();
    
    try {
        // [핵심 비즈니스 로직] 
        accountDao.withdraw(fromId, amount);
        accountDao.deposit(toId, amount);
        
        // [부가 기능] 트랜잭션 커밋
        transactionManager.commit(); 
    } catch (Exception e) {
        // [부가 기능] 예외 발생 시 롤백
        transactionManager.rollback();
        throw e;
    } finally {
        // [부가 기능] 실행 시간 측정 종료 & 로깅
        log.info("계좌 이체 소요 시간: {}ms", System.currentTimeMillis() - startTime);
    }
}
```

⚠️ **위 코드는 아래와 같은 문제가 있습니다.**
- **코드 중복:** 수십 개의 서비스 메서드마다 **동일한 로깅 및 트랜잭션 코드를 복사해서 붙여**넣어야 합니다.
- **SRP(단일 책임 원칙) 위반:** 비즈니스 로직과 인프라 로직이 **한 클래스에 존재하여** 코드를 읽기 매우 힘듭니다.
- **유지보수 어려움:** 로깅 포맷 하나를 바꾸기 위해 수십 개의 파일을 일일이 수정해야 합니다.

#### 💡 AOP를 적용
공통 로직을 한 곳에만 정의하고 애노테이션등을 통해 선언적으로 지정해주면 됩니다.
```java
@Transactional // 트랜잭션 부가 기능 적용
@LogExecutionTime // 로깅 부가 기능 적용
public void transferMoney(String fromId, String toId, int amount) {
    // [핵심 비즈니스 로직]만 남음!!
    accountDao.withdraw(fromId, amount);
    accountDao.deposit(toId, amount);
}
```


### 🔖 AOP 주요 용어

| **용어** | **개념 설명** |
| ---- | ---- |
| **Target** | **부가 기능(Advice)**이 적용될 **실제 객체.** (예: `OrderService`) |
| **Advice** | 타겟에 적용할 **실제 부가 기능 로직**. (언제, 무엇을 할 것인가? 예: 메서드 실행 전 트랜잭션 시작) |
| **JoinPoint** | **Advice**가 적용될 수 있는 모든 지점입니다. (**스프링 AOP는 메서드 실행 시점만 지원함**) |
| **Pointcut** | 수많은 JoinPoint 중 **실제로 Advice를 적용할 타겟을 필터링**하는 기준(표현식). |
| **Aspect** | **Advice + Pointcut**. 공통 관심사를 모듈화한 AOP의 기본 단위 (예: 트랜잭션 관리자) |

## 💡 스프링 AOP의 동작원리: 프록시(Proxy) 패턴
> **스프링은 원본 코드를 그대로 둔 채 프록시 객체를 통해 AOP를 구현합니다**

### 왜 원본 객체가 아닌 프록시를 사용할까?
AOP 기술 중에는 `AspectJ`처럼 컴파일 시점이나 클래스 로드 시점에 원본 클래스의 바이트코드(`.class`)를 직접 수정하여 부가 기능을 삽입하는 방식도 있습니다.
- 하지만 스프링은 프록시 방식을 선택했습니다.

#### 1️⃣ 복잡한 빌드 환경이나 전용 컴파일러 불필요
바이트코드를 직접 조작하려면 표준 **Java 컴파일러 외에 AspectJ 전용 컴파일러**나 별도의 빌드 플러그인 세팅이 필요합니다. 
반면, 스프링 프록시 방식은 **자바의 기본 표준 기술(인터페이스 기반 구현이나 클래스 상속)**만을 사용하여 런타임에 가짜 객체를 만듭니다. 따라서 개발 환경이나 빌드 스크립트가 복잡해지지 않고 자바 생태계를 그대로 유지할 수 있습니다.

#### **2️⃣ 스프링 IoC/DI 컨테이너 **
스프링은 애초에 객체(빈)의 생성과 주입을 프레임워크가 전담하는 컨테이너입니다. 
빈이 생성되고 클라이언트에게 주입(DI)되기 전에 진짜 객체 대신 프록시 객체로 주입해 주기만 하면 됩니다. 이를 통해 바이트코드를 건드리는 작업 없이 처리할 수 있습니다.

#### 3️⃣ 객체의 구조적 무결성 보호 (비침투성)
메모리에 이미 로드된 원본 클래스나 싱글톤 객체의 내부 구조(바이트코드) 자체를 런타임에 수정하는 것은 JVM 환경에서 예상치 못한 부작용이나 클래스 로더 충돌을 일으킬 위험이 있습니다. 
반면, 프록시 패턴은 원본 객체의 코드는 건드리지 않으면서 겉을 감싸는 **래퍼(Wrapper) 역할을 수행**합니다. 이를 통해 원본 객체의 순수성을 완벽하게 보호하면서도 안전하게 부가 기능을 끼워 넣을 수 있습니다.

### 프록시 기반 Spring AOP 흐름도
클라이언트는 진짜 빈을 호출한다고 생각하지만 실제로는 프록시가 요청을 가로채어 부가기능을 수행한 뒤에 진짜 빈에게 로직을 위임합니다.
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F7bfa69f7-77ba-4fe2-a7a5-1ae5da1d38c0%2Fimage.png?table=block&id=371d67b9-9e80-800a-8318-f35472a3a222&cache=v2" alt="image" width="1556" height="320" loading="lazy" />

1. 클라이언트가 스프링 빈(Bean)의 메서드를 호출합니다. 이때 실제로는 **프록시 객체**를 호출합니다.
2. 프록시 객체가 호출을 가로채고 등록된 **`Advice`****(부가 기능)를 실행**합니다.
3. **Advice 실행 후(또는 전) 원본 객체(Target)의 실제 메서드를 호출**합니다.
4. 결과를 클라이언트에게 반환합니다.

#### 👀 예시
```java
@Service
public class OrderService { // 진짜 객체 (Target)
    @Autowired
    private OrderRepository repository; // 진짜 객체는 완벽하게 주입되어 있음

    @Transactional
    public void createOrder() {
        repository.save(); // 진짜 객체가 실행하면 정상 작동!
    }
}
```

스프링 컨테이너가 위 클래스를 보고 `CGLIB`을 통해 상속을 받아 **프록시 객체**를 만듭니다.
```java
// 스프링이 런타임에 동적으로 생성한 가짜 객체 (Proxy)
public class OrderService$$EnhancerBySpringCGLIB extends OrderService {
    
    // ⚠️ 주의: 프록시 객체의 내부 필드(repository)는 주입되지 않아 null 상태입니다!
    private OrderService target; // 진짜 객체를 가리키는 Target을 들고 있음

    @Override
    public void createOrder() {
        // 프록시는 진짜 객체(target)에게 위임합니다.
        target.createOrder(); 
    }
}
```

:::callout 💡 **프록시**는 스프링의 의존성 주입(DI)을 온전히 받은 객체가 아닙니다. 
:::callout 즉, 프록시 안에서 비즈니스 로직을 직접 실행하려고 하면 `DB 커넥션이`나 `Repository`가 모두 `null`이라 문제가 발생합니다.
:::callout - 따라서 진짜 빈(Target)을 필드로 가지고 있다 **실제 Target에게 로직을 위임**하는 것입니다.

### 스프링은 어떻게 프록시를 생성하고 빈(Bean)으로 등록할까?
스프링 프레임워크가 개발자 대신 원본 객체를 대신하여 프록시 객체를 컨테이너에 등록하는 과정은 스프링의 빈 생명주기(Bean Lifecycle)와 **`BeanPostProcessor`****(빈 후처리기)** 메커니즘을 통해 이루어집니다.

#### 1️⃣ 원본 빈 인스턴스화 및 의존성 주입
스프링 컨테이너는 먼저 클래스 정보를 바탕으로 실제 타겟(Target) 객체를 (ex: `OrderService`)를 인스턴스화하고 필요한 의존성(ex: `OrderRepository` 등)을 완벽하게 주입합니다. 
이때까지만 해도 해당 객체는 순수한 원본 객체입니다.

#### 2️⃣ 빈 후처리기(BeanPostProcessor)의 AOP 대상 확인
객체가 스프링 컨테이너에 최종 등록되기전 스프링은 **BeanPostProcessor**를 호출합니다.
- `AnnotationAwareAspectJAutoProxyCreator`라는 빈 후처리기가 생성된 객체 클래스나 메서드를 검사해 `@Transactional` 등의 AOP 적용 대상인지 확인합니다.

#### 3️⃣ 프록시 생성 및 컨테이너 등록(ProxyFactory)
**AOP 적용 대상임이 확인되면** 스프링은 원본 객체를 컨테이너에 바로 등록하지 않고 `ProxyFactory`을 통해 프록시 객체를 생성합니다.
- 클래스가 인터페이스를 구현하고 있지 않다면 **CGLIB(Code Generation Library)** 기술을 사용하여 런타임 메모리 상에서 원본 클래스를 상속(`extends`)받은 프록시 객체를 동적으로 생성합니다.
- 생성된 프록시 객체 내부의 `target` 참조 변수에 원본 객체를 연결합니다.
- 최종적으로 **스프링 IoC 컨테이너에는 원본 객체 대신 이 프록시 객체가 빈으로 등록**됩니다.
## 🆚 CGLIB vs JDK Dynamic Proxy
스프링이 가짜 객체(프록시)를 만드는 두 가지 기술입니다.

| **구분** | **JDK 동적 프록시 (JDK Dynamic Proxy)** | **CGLIB (Code Generation Library)** |
| ---- | ---- | ---- |
| **요구사항** | **인터페이스 필수** | 인터페이스 불필요 |
| **생성 원리** | 인터페이스를 구현(`implements`)하여 프록시 생성 | 원본 클래스를 상속(`extends`)하여 프록시 생성 |
| **동작 방식** | 자바 기본 제공 리플렉션(Reflection) 사용 | 바이트코드 조작 라이브러리 사용 |
| **제한사항** | 인터페이스 없는 클래스 적용 불가 | `final` 클래스, `final` 메서드에 적용 불가 |
| **Spring 기본값** | Spring 4.x 이전 기본값 | **Spring Boot 2.x 이후 기본값** |

:::callout 💡 **Spring Boot 기본 동작**
:::callout `Spring Boot 2.x`부터는 인터페이스 유무와 상관없이 기본으로 **CGLIB 프록시**를 사용합니다. (`spring.aop.proxy-target-class=true`)
:::callout - `Spring Boot 1.x`는 **JDK 동적 프록시**를 기본으로 사용했습니다.

## ⚠️ AOP 프록시의 한계:  내부 호출(Self-Invocation) 문제
같은 클래스 내에서 메서드를 <span class="text-red">**내부 호출**</span>하면 **프록시를 거치지 않기 때문에 AOP가 적용되지 않습니다.**
```java
@Service
public class OrderService {

    // 클라이언트가 호출하는 진입점
    public void processOrders() { 
        // ❌ AOP 적용 실패! 
        // this.createOrder()가 호출되는데 this는 프록시가 아닌 진짜 객체입니다.
        this.createOrder();  
    }

    @Transactional // AOP를 기대함
    public void createOrder() { 
        // ... DB 저장 로직 ...
    }
}
```

### 🔍 왜 AOP가 적용이 되지 않을까?
클라이언트가 외부에서 호출할 때는 프록시를 거치지만 내부에서 `this`로 호출하면 이미 진짜 객체 안으로 들어온 상태이므로 프록시를 거칠 방법이 없습니다. 
- 외부에서 호출 순서(OrderService 호출 시): `프록시 → Advice → 원본 객체`
- 원본 객체는 AOP를 몰라 Advice가 실행되지 않습니다.
- 따라서 `@Transactional`이나 `@Cacheable` 등이 완전히 무시됩니다.

### 💡 해결 방법

| 해결 방법 | 동작 원리 및 설명 | 장점 및 단점 (실무 권장 여부) |
| ---- | ---- | ---- |
| **별도 클래스로 분리**
(Extract Class) | 내부 호출되던 메서드를 아예 **새로운 서비스 클래스(Bean)로 분리**하고 이를 DI(의존성 주입) 받아 외부 호출 형태로 변경합니다. | 클래스의 책임이 명확해지며(SRP 준수) AOP가 가장 자연스럽게 적용됩니다. |
| **자기 자신 주입**
(Self-Injection) | `@Autowired`나 `@Lazy`를 사용해 **자기 자신의 프록시 객체를 필드로 주입**받고 내부 호출 시 `this`가 아닌 주입받은 프록시를 통해 호출합니다. | **Spring Boot 2.6부터 순환 참조가 기본적으로 금지**되어 서버 구동 시 에러가 발생합니다. (이를 피하려면 `@Lazy`를 써야 하는데 코드가 이상하게 변합니다.) |
| **AopContext 사용**
(currentProxy) | `AopContext.currentProxy()`를 호출하여 **현재 AOP 프록시 객체를 직접 가져와** 호출합니다. | 외부 주입 없이 내부 로직만으로 해결 가능지만 스프링 AOP라는 특정 기술 API에 코드가 강하게 종속되며 단위 테스트가 매우 힘들어집니다. 별도의 설정(`exposeProxy=true`)도 해야 합니다. |

## 🧑‍💻 @Transactional 내부 동작 살펴보기
우리가 흔히 쓰는 `@Transactional`은 **Advice**가 아니라 포인트컷 판단에 사용되는 메타데이터(마커)입니다.
- 단지 스프링 AOP 프록시 생성시 해당 메서드에 트랜잭션 부가기능이 필요하다고 알리는 것.
실제로 트랜잭션 부가 기능을 수행하는 **Advice**는 스프링 내부의 **`TransactionInterceptor`** 클래스입니다. 

#### 💡 **스프링 트랜잭션의 AOP 구조**
- **Pointcut (적용 위치 판단):** `@Transactional` 애노테이션의 존재 여부
- **Advice (실제 부가 기능 로직):** `TransactionInterceptor` 클래스
- **Aspect (AOP 모듈):** `Advisor` (포인트컷 + 어드바이스의 결합)

### `TransactionInterceptor` (AOP Advice의 진입점)
프록시 객체가 클라이언트의 요청을 가로채면 가장 먼저 스프링 내부에 미리 등록된 `TransactionInterceptor`라는 클래스로 제어권이 넘어옵니다. 
- 이 클래스가 바로 트랜잭션 AOP의 **실제 Advice 역할**을 담당합니다.
```java
public class TransactionInterceptor extends TransactionAspectSupport implements MethodInterceptor, Serializable {
    
    // 클라이언트의 요청이 프록시를 거쳐 이곳(invoke)으로 들어옵니다.
    @Override
    public @Nullable Object invoke(final MethodInvocation invocation) throws Throwable {
        
        // 1. 타겟 클래스(진짜 비즈니스 객체)의 정보를 추출합니다.
        Class<?> targetClass = (invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null);

        // 2. 부모 클래스(TransactionAspectSupport)의 핵심 메서드인 
        // invokeWithinTransaction()을 호출하여 실제 트랜잭션 처리를 위임합니다.
        return invokeWithinTransaction(invocation.getMethod(), targetClass, new InvocationCallback() {
            @Override
            public Object proceedWithInvocation() throws Throwable {
                // 3. 콜백: 트랜잭션 준비가 끝나면, 이 proceed()를 통해 진짜 비즈니스 로직을 실행하라!
                return invocation.proceed();
            }
        });
    }
}
```

`TransactionInterceptor`는 요청을 가로채는 **진입점** 역할을 수행하여 실제 복잡한 트랜잭션 관리 로직은 부모 클래스인 `TransactionAspectSupport`에게 **콜백(Callback) 형태**로 넘깁니다.

### TransactionAspectSupport (실제 트랜잭션 처리)
`TransactionInterceptor`의 부모 클래스인 `TransactionAspectSupport` 안에는 트랜잭션의 생명주기를 관장하는 핵심 메서드인 `invokeWithinTransaction()`이 있습니다.
<u>**AOP의 실행 시점(Before, After)**</u>이 이 코드의 `try-catch` 블록 안에 구현되어 있습니다.
```java
// TransactionAspectSupport 내부의 실제 트랜잭션 처리 흐름 (의사 코드)
protected Object invokeWithinTransaction(...) {
    
    // [Before Advice] 트랜잭션 매니저를 통해 트랜잭션 시작 (AutoCommit False)
    TransactionInfo txInfo = createTransactionIfNecessary(...);

    try {
        // [Target Method 호출] 넘겨받은 콜백을 통해 진짜 비즈니스 로직 실행
        Object retVal = invocation.proceed();

        // [After Returning Advice] 예외 없이 끝나면 Commit 수행
        commitTransactionAfterReturning(txInfo);
        return retVal;
        
    } catch (Throwable ex) {
        // [After Throwing Advice] 예외 발생 시 Rollback 수행
        completeTransactionAfterThrowing(txInfo, ex);
        throw ex;
    }
}
```


### 🔍 흐름 요약
`@Transactional`이 동작하는 전체 과정은 다음과 같은 파이프라인을 거칩니다.
1. **Client:** `orderService.createOrder()` 호출
2. **Proxy:** 요청 가로채기
3. **Interceptor (****`invoke`****):** 부가 기능 진입
4. **AspectSupport (****`createTransactionIfNecessary`****):** 트랜잭션 시작 (DB Connection Lock)
5. **Target (****`proceed`****):** 개발자가 작성한 비즈니스 로직 실행
6. **AspectSupport (****`commit`**** or ****`rollback`****):** 결과에 따라 DB 반영 또는 취소

## 📚 Ref.
<span class="inline-link" data-url="https://docs.spring.io/spring-framework/reference/core/aop/introduction-defn.html?utm_source=chatgpt.com" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://docs.spring.io/spring-framework/docs/4.3.15.RELEASE/spring-framework-reference/html/aop.html" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://www.youtube.com/watch?v=Hm0w_9ngDpM" data-domain="youtube.com"></span>

