---
id: "371d67b9-9e80-805b-9cfa-e6a603f9e026"
title: "Spring Bean"
slug: "spring-bean"
category: "개발"
tags: ["Spring Bean"]
date: "2026-05-28"
dateEnd: ""
createdAt: "2026-05-31T15:57:00.000Z"
excerpt: "Spring Bean이란? A bean is an object that is instantiated, assembled, and managed by a Spring IoC cont..."
thumbnail: ""
groupId: "36fd67b9-9e80-80ae-a9ff-d6264af85293"
groupSlug: "spring-boot"
lastEdited: "2026-05-31T15:58:00.000Z"
---

## Spring Bean이란?
> **A ****`bean`**** is an object that is instantiated, assembled, and managed by a ****`Spring IoC container`****.**
> - Spring Framework 공식 문서

일반적인 자바 프로그램에서는 개발자가 직접 `new` 키워드를 사용하여 객체를 생성합니다. 이렇게 만들어진 객체는 평범한 자바 객체(POJO: Plain Old Java Object)입니다.
반면, <span class="text-green">**Spring Bean**</span>은 **스프링 IoC 컨테이너가 제어권(생성, 의존성 주입, 생명주기 관리)을 가지고 직접 관리하는 자바 객체**를 의미합니다.
## 🤔 스프링 빈이 왜 필요한가?
의존성을 주입하기 위해 개발자가 직접 `new` 키워드를 사용해 객체를 생성한다고 가정해 보겠습니다.
### ⚠️ 문제점 1: 확장에 취약한 강한 결합
```java
// 개발자가 직접 구현체를 선택하고 초기화하는 상황
AService aService = new AService(new JdbcADao());
```

만약 구현체를 변경하여 `JdbcADao` 대신 `InMemoryADao`를 써야 한다면? 
```java
AService aService = new AService(new InMemoryADao());
```

`AService`를 사용하는 모든 코드를 찾아다니며 `new InMemoryADao()`로 수정해야 합니다. 
즉, 클라이언트 코드가 구현체에 강하게 결합되어 유연성이 떨어집니다.

### ⚠️ 문제점 2: 의존성 지옥 (Dependency Hell)
의존성을 주입할 때 여러 의존성이 필요한 상황이라면 여러 **의존성의 주입 순서**도 알아야 합니다.
또한, 애플리케이션이 커지고 비즈니스 로직이 복잡해지면서 객체 하나를 만들기 위해 의존관계에 있는 수많은 객체를 순서대로 생성해야 합니다.
```java
// A 객체 하나를 만들기 위해 파악해야 하는 끔찍한 의존 관계
A a = new A(new B(new C(new D(new E(new F(new AA(new AAA()), new AB(new AAA(), new AAB())))))));
```

이런 구조에서는 의존 관계를 파악하는 것이 매우 힘들고 동일한 객체(`AAA`)가 메모리상에 중복으로 생성되는 심각한 비효율이 발생합니다.

🚀 따라서 비즈니스 로직을 처리하는 객체들을 **`빈(Bean)`****으로 등록하여 스프링 IoC 컨테이너가 알아서 생성하고 필요한 곳에 의존성을 주입하도록 제어권을 넘겨야 합니다.**

## Bean 등록과 메타데이터 (Bean Definition)
스프링은 `BeanDefinition`이라는 것을 기준으로 빈을 생성합니다.
:::callout ℹ️ **`BeanDefinition`**
:::callout - 스프링 컨테이너가 빈(Bean)을 생성하고 관리하기 위해 사용하는 **빈 설정 메타정보(Configuration Metadata)**입니다.
스프링 컨테이너는 자바 코드(`@Bean`), 애노테이션(`@Component`), `XML` 등 다양한 설정 형식을 지원합니다. 이 다양한 형식을 스프링이 이해할 수 있도록 규격화한 <u>**단일 메타데이터**</u>가 `BeanDefinition`입니다. 
- 빈의 클래스 이름, 스코프, 지연 로딩 여부, 초기화 메서드 이름 등이 담겨 있습니다.
이를 통해 스프링 컨테이너는 자바 코드(`@Bean`) 인지 `XML`인지 알 필요 없이 **BeanDefinition**만 바라봅니다.
### Bean 등록 방식

| **분류** | **애노테이션 예시** | **설명** |
| ---- | ---- | ---- |
| **자동 등록**
(Component Scan) | `@Component`, `@Service`
`@Repository`, `@Controller` | 개발자가 직접 작성한 비즈니스 로직 클래스. 스프링 부트가 시작될 때 패키지를 싹 스캔해서 알아서 빈으로 등록 |
| **수동 등록**
(Java Configuration) | `@Configuration` 클래스 내부의
`@Bean` 메서드 | 외부 라이브러리(예: `ObjectMapper`, `RestTemplate`)를 빈으로 만들고 싶거나 상황에 따라 다형성을 이용해 구현체를 교체해야 할 때 명시적으로 사용 |

## 🧩 **의존성 주입(DI) 충돌과 우선순위 해결**
스프링이 빈을 자동 주입하려고 할 때 해당 인터페이스를 구현한 **구현체 빈이 2개 이상**이라면 스프링은 어떤 것을 주입해야 할지 몰라 `NoUniqueBeanDefinitionException`을 발생시킵니다. 
스프링에서는 이런 문제를 해결하기 위해 **어노테이션**을 사용해 의존성 주입시 우선순위를 정할 수 있습니다.
#### @Primary : 메인 구현체 지정
> 여러개의 구현체중 하나의 구현체로 의존성을 주입하고자 할때 사용합니다.

```java
@Component
@Primary // 의존성 주입 시 최우선으로 선택됨
public class DatabaseOrderRepository implements OrderRepository {}

@Component
public class MemoryOrderRepository implements OrderRepository {}
```


#### @Qualifier: 특정 빈을 명시적으로 지정
상황에 따라 특정 구현체를 주입받고 싶을 때 사용합니다. 
- `@Primary`보다 `@Qualifier`가 더 높은 우선순위를 가집니다.
```java
@Component
@Qualifier("mainDiscountPolicy")
public class RateDiscountPolicy implements DiscountPolicy {}

@Service
public class OrderService {
    public OrderService(@Qualifier("mainDiscountPolicy") DiscountPolicy discountPolicy) {
        // 정확히 RateDiscountPolicy가 주입됨
    }
}
```


## Spring Bean의 생명주기 (Lifecycle)
> **스프링 IoC 컨테이너가 빈의 라이프사이클을 어떻게 관리?!?**

#### 1️⃣ 인스턴스화(객체 생성 + property 설정)
`Bean Definition`을 바탕으로 자바 객체를 생성합니다.
스프링 IoC 컨테이너가 초기화될 때 빈의 스코프가 **싱글톤**인 경우 즉시 객체를 생성하여 관리합니다. (싱글톤이 아닌 경우 요청 시점에 객체를 생성합니다.)
- 싱글톤 스코프는 컨테이너 초기화 시 즉시 생성되며 **싱글톤 레지스트리**에 저장되어 항상 동일한 객체 반환 보장합니다.
- 빈의 이름을 `key`로 객체를 `value`로 저장
- 스프링은 빈의 이름을 이용해 항상 동일한 객체를 반환합니다.
#### 2️⃣ 의존성 주입(DI)
빈이 생성이 되고 나면 **스프링 IoC 컨테이너**는 `의존성 자동 주입`을 통해 생성된 객체 안에 필요한 다른 빈들을 **주입**해 줍니다.
- 단, 생성자 주입 방식은 1번(객체 생성)과 동시에 의존성이 주입됩니다
#### 3️⃣ 초기화
의존성 주입이 끝난 후 DB 커넥션 풀을 맺거나 외부 API와 소켓을 연결하는 등의 초기 세팅을 진행합니다.
#### 4️⃣ 사용
애플리케이션 구동 중 클라이언트의 요청을 받아 실제 서비스 비즈니스 로직을 처리합니다
#### 5️⃣ 소멸
스프링 컨테이너가 종료되기 직전 열어둔 DB 커넥션이나 네트워크 자원을 안전하게(Graceful) 종료하고 반납합니다.

## Bean Scope와 멀티스레드 동시성
:::callout ℹ️ **빈 스코프(Bean Scope)**
:::callout - 빈은 생성되고 존재하고 적용되는 범위를 지정할 수 있습니다. 이를 **빈 스코프**라고 합니다.
:::callout - 빈을 적용하는 객체에 `@Scope` 어노테이션을 통해서 설정할 수 있습니다.
:::callout - 별도의 설정이 없다면 기본값은 **싱글톤**입니다.
### 스코프 비교

| **스코프 (Scope)** | **생성 및 관리** | **특징** |
| ---- | ---- | ---- |
| **Singleton**
(싱글톤, default) | 스프링 컨테이너 시작 시 1개만 생성. 종료 시점까지 컨테이너가 관리함. | 동일한 빈을 요청하면 **항상 같은 메모리 주소를 가진 똑같은 객체**를 반환합니다. 메모리 낭비가 적어 대규모 트래픽 처리에 유리합니다. |
| **Prototype**
(프로토타입) | 요청이 올 때마다 **매번 새로운 객체**가 생성이 됨. | 생성과 의존성 주입까지만 스프링이 해주고 이후 관리는 개발자가 하게됩니다. |

### 빈을 싱글톤으로 관리하지 않는다면?
스프링 부트 기반의 웹 애플리케이션은 초당 수십~수백 번의 HTTP 요청을 받습니다.
만약 서비스 객체(`OrderService`)가 싱글톤이 아니라면 요청이 올 때마다 새로운 객체가 메모리에 생성되고 요청이 끝나면 **가비지 컬렉터**가 이를 지워야 합니다. 이는 엄청난 메모리 낭비와 CPU 부하, GC으로 인해 성능 저하가 발생합니다. 
빈을 **싱글톤**으로 설정하면 단 하나의 객체만 생성하여 재사용하므로 이러한 자원 낭비를 방지할 수 있습니다

### 🚨 멀티스레드와 싱글톤 빈의 동시성 문제
웹 애플리케이션은 기본적으로 `수십 ~ 수백` 개의 스레드가 동시에 요청을 처리합니다. 
싱글톤 빈은 단 한 개이므로 모든 스레드가 이 **하나의 객체를 동시에 접근**해서 사용하게 됩니다.
#### 🧑‍💻 **위험한 코드 예시: 상태를 가지는(Stateful) 빈**
```java
@Service
public class OrderService{
    private int orderPrice; // ❌ 여러 스레드가 동시에 공유하고 수정하는 전역 변수

    public void processOrder(int price){
        this.orderPrice = price; // 사용자A가 결제 금액 10,000원을 저장함    
        // 이때, B가 50,000원을 덮어씀!
        pay(this.orderPrice); // 사용자 A가 50,000원을 결제해버리는 대형 사고 발생!
    }
}
```

🚀 **빈 스코프를 싱글톤으로 설정할 경우 상태를 가지면 안되고 반드시 무상태(Stateless)로 설계해야 합니다.**
- 공유되는 멤버 변수를 만들지 말고 메서드 내부의 **지역 변수**나 **파라미터**, 혹은 `ThreadLocal`을 사용하여 스레드 간 자원 간섭을 차단해야 합니다.
👀 **프로토타입 스코프 빈은 모든 스레드에서 공유하는게 아니므로 상태를 가질 수 있습니다.**

## 📚 Ref.
<span class="inline-link" data-url="https://docs.spring.io/spring-framework/reference/core/beans/definition.html" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://tech.kakaopay.com/post/martin-dev-honey-tip-2/" data-domain="tech.kakaopay.com"></span>
<span class="inline-link" data-url="https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html#beans-constructor-injection" data-domain="docs.spring.io"></span>
