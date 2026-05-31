---
id: "371d67b9-9e80-8031-ac9b-d20b6d2d02d3"
title: "IoC와 DI, Spring Boot 컨테이너"
slug: "ioc와-di-spring-boot-컨테이너"
category: "개발"
tags: ["IoC","DI","Spring 컨테이너"]
date: "2026-05-30"
dateEnd: ""
createdAt: "2026-05-31T15:58:00.000Z"
excerpt: "↗️ 제어의 역전 (IoC, Inversion of Control) 프로그램의 제어 흐름을 개발자가 직접 제어하는 것이 아닌 외부에서 관리하는 것을 의미합니다. 할리우드 원칙이라고..."
thumbnail: ""
groupId: "36fd67b9-9e80-80ae-a9ff-d6264af85293"
groupSlug: "spring-boot"
lastEdited: "2026-05-31T15:59:00.000Z"
---

## ↗️ 제어의 역전 (IoC, Inversion of Control)
**프로그램의 제어 흐름**을 개발자가 직접 제어하는 것이 아닌 외부에서 관리하는 것을 의미합니다.
- `할리우드 원칙`이라고도 불립니다.

:::callout 💡 **할리우드 원칙 (Don't call us, we'll call you)**
:::callout - 영화사 오디션에서 배우가 캐스팅 여부를 계속 묻는 대신 영화사에서 필요할 때 배우에게 연락하는 상황에서 유래했습니다
:::callout - 즉, 객체가 직접 필요한 기능을 호출하고 생성하는 대신 프레임워크가 객체의 생명주기를 통제하고 필요할 때 메서드를 호출하는 구조를 뜻합니다.
### 🍕 피자 예시로 보는 IoC가 필요한 이유 
#### AS-IS) 변경에 꽉 막힌 코드 (제어권: APizza 내부)
```java
public class APizza {
    ThinDough thinDough;
    MozzarellaCheese mozzarellaCheese;
    ChiliSauce chiliSauce;
    HotSauce hotSauce;
  
    public APizza() {
        // APizza 스스로 어떤 재료를 쓸지 통제하고 직접 생성(new)함.
        this.thinDough = new ThinDough();
        this.mozzarellaCheese = new MozzarellaCheese();
        this.chiliSauce = new ChiliSauce();
        this.hotSauce = new HotSauce();
    }
}
```

객체 내부에서 재료의 종류를 스스로 제어하고 있습니다. 
만약 핫소스를 빼거나 치즈를 변경하고 싶다면 `APizza` 클래스의 내부 코드를 직접 뜯어고쳐야 하므로 변경에 자유롭지 않습니다.

#### TO-BE) 변경에 유연한 코드
```java
public class APizza {
    ThinDough thinDough;
    MozzarellaCheese mozzarellaCheese;
    List<ChiliSauce> sauces;

    // 스스로 생성하지 않고 외부에서 종류에 상관없이 인자로 받아 필드를 초기화함!
    public APizza(ThinDough thinDough, MozzarellaCheese mozzarellaCheese, List<ChiliSauce> sauces) {
        this.thinDough = thinDough;
        this.mozzarellaCheese = mozzarellaCheese;
        this.sauces = sauces;
    }
}
```

재료를 선택하고 생성하는 <span class="text-red">**제어권**</span>이 `APizza` 내부에서<span class="text-red">** 외부(요청하는 쪽)로 역전(Inversion)**</span>되었습니다. 
이를 통해 객체 내부에서 재료를 제어해 변경에 닫혀있던 코드가 외부의 제어를 받으면서 변경에 좀 더 자유로워졌습니다.
### 역할과 책임의 분리
**IoC**는 `역할과 책임의 분리`라는 내용과 관련이 있습니다.
> **역할과 관심을 분리해 응집도를 높이고 결합도를 낮추며 이에 따라 변경에 유연한 코드를 작성할 수 있는 구조가 될 수 있기 때문**

### 제어권 비교

| **비교** | **전통적인 개발 방식 (제어권: 개발자)** | **스프링 프레임워크 (제어권: 컨테이너)** |
| ---- | ---- | ---- |
| **객체 생성** | 개발자가 직접 `new` 연산자를 사용해 객체를 생성 | 프레임워크가 알아서 객체(Bean)를 생성 |
| **의존성 연결** | 개발자가 필요한 객체를 직접 찾아서 조립 | 프레임워크가 필요한 객체를 찾아서 주입(DI)해 줌 |
| **생명 주기** | 개발자가 메모리 할당 및 해제를 관리 | 프레임워크가 초기화, 소멸 등을 전담 |

## 의존 역전 원칙 (DIP, Dependency Inversion Principle)
`IoC`를 통해 제어권을 외부로 넘겼다면 클래스 간의 결합을 더욱 느슨하게 만들기 위해 <span class="text-red">**DIP**</span>를 적용해야 합니다.
:::callout ℹ️ **DIP**
:::callout 상위 레벨의 모듈은 절대 하위 레벨 모듈에 의존해서는 안 되며 **둘 다 추상화(인터페이스)에 의존해야 한다.**
### 🍕 피자 예시로 보는 DIP와 역할의 분리
#### AS-IS) 강하게 결합된 코드 (DIP 위배)
```java
public class APizza { // 상위 모듈
  ThinDough thinDough; // 'ThinDough'라는 저수준 모듈(구체 클래스)에 직접 의존!
  
  public APizza(ThinDough thinDough) {
      this.thinDough = thinDough;
  }
}
```

:::callout ⚠️ **문제점**
:::callout - 고수준 모듈(`APizza`)이 저수준 모듈(`ThinDough`)에 직접 의존하고 있습니다.
:::callout - 이 상태에서는 외부에서 다른 도우(`CheeseCrustDough`)를 사용하고 싶다면 `APizza`의 내부 코드를 고쳐야 합니다.
#### TO-BE) 추상화에 의존하는 코드
```java
public interface Dough {}
public interface Cheese {}
public interface Sauce {}

public class APizza { // 상위 모듈
  Dough dough; // 추상화(인터페이스)에 의존!
  Cheese cheese; 
  List<Sauce> sauces; 

  public APizza(Dough dough, Cheese cheese, List<Sauce> sauces) {
      this.dough = dough;
      this.cheese = cheese;
      this.sauces = sauces;
  }
}
```

:::callout 💡 **해결**
:::callout **고수준 모듈(****`APizza`****)**이 **저수준 모듈(특정 재료)**에 의존하지 않고 재료들의 인터페이스에 의존합니다.
:::callout - 저수준 모듈(재료 구현체)들 역시 인터페이스에 의존
🚀 **의존의 방향이 추상화로 역전(DIP)**됨으로써 한 클래스의 변경이 다른 클래스에 미치는 영향을 최소화하고 애플리케이션을 지속 가능하게 확장할 수 있게 되었습니다.

## 의존성 주입 (DI, Dependency Injection)
> `IoC`와 `DIP`가 <u>설계 원칙</u>이라면 <span class="text-red">**DI**</span>는 이를 실제로 코드로 구현하는 `디자인 패턴`입니다.

객체가 자신이 의존할 다른 객체를 직접 생성하는 것이 아니라, **외부(스프링 컨테이너)에서 생성된 객체를 주입받는 것**입니다.
###  의존성 주입의 3가지 방식

| **주입 방식** | 설명 |
| ---- | ---- |
| **필드 주입** | 필드에 직접 `@Autowired`를 선언하는 방식. 코드가 매우 간결하고 선언이 간단 |
| **수정자 주입** | `setXxx()` 메서드를 만들고 그 위에 `@Autowired`를 선언하는 방식 |
| **생성자 주입** | 생성자를 통해 필요한 의존성을 주입받는 방식 |

### 🔍 생성자 주입을 권장하는 이유
> **스프링 프레임워크 공식 문서**에서도 의존성 주입 시 <span class="text-red">**생성자 주입(Constructor Injection)**</span>을 사용할 것을 권장하고 있습니다.  

#### 1️⃣ 불변성 (Immutability) 보장
의존 관계는 애플리케이션이 구동될 때 한 번 맺어지면 종료될 때까지 거의 변경될 일이 없습니다.
생성자 주입을 사용하면 필드에 **`final`**** 키워드**를 사용할 수 있습니다. 
이를 통해 런타임에 의존성을 임의로 조작하는 것을 자바 언어 컴파일러 단에서 막을 수 있습니다.

#### 2️⃣ 순환 참조 방어
```java
A → B → A
```

이처럼 A 클래스가 B 클래스를 부르고 B 클래스가 다시 A 클래스를 부르는 것을 **순환 참조**라고 합니다.
- **필드/수정자 주입 방식:** 스프링이 빈(객체)을 먼저 다 만들어 둔 다음 주입을 시도하므로 서버는 정상적으로 켜집니다. 하지만 사용자가 해당 로직을 호출하는 순간 서로를 계속해서 호출하며 `StackOverflowError`로 서버가 다운됩니다.
- **생성자 주입 방식:** A 객체를 만들려면 B 객체가 필요한데 B 객체를 만들려면 다시 A 객체가 필요한 모순이 발생합니다. 스프링 컨테이너는 이를 파악하고 **서버를 켜는 시점에 즉시 에러를 내며 멈춰버립니다.** 
:::callout 💡 **Spring Boot 2.6 Release Notes: Circular References Prohibited by Default**
:::callout - Circular references between beans are now prohibited by default. If your application fails to start due to a `BeanCurrentlyInCreationException` you are strongly encouraged to update your configuration to break the dependency cycle.
:::callout **스프링 부트 2.6 릴리즈 노트를 보면 순환 참조가 기본적으로 금지되어 다른 주입 방식을 사용해도 기본적으로 에러가 발생하며 서버가 실행되지 않습니다.**

#### 3️⃣ NPE 방지
**생성자 주입**은 `이 의존성들이 모두 준비되지 않으면 아예 객체를 만들지 않겠다`는 의미입니다. 
따라서 빈이 생성되었다면 내부 의존성이 모두 `null`이 아님을 보장받기 때문에 실행 도중 `NullPointerException`이 발생할 확률을 줄여줍니다.

#### 4️⃣ 순수 자바 코드를 이용한 단위 테스트용이성
**필드 주입 방식(**`@Autowired private Dough dough;`)을 사용시 **스프링 컨테이너**를 띄우지 않는 이상 해당 필드(`dough`)에 값을 넣을 방법이 없습니다.
하지만 **생성자 주입을 사용하면** 무거운 스프링 컨테이너를 실행하지 않고도 순수 자바 코드만으로 가짜 객체(`Mock`)를 넣어 매우 빠르고 독립적인 단위 테스트를 작성할 수 있습니다.
```java
// 스프링 없이 자바로 진행하는 단위 테스트 예시
@Test
void pizzaOrderTest() {
    // 가짜(Mock) 재료 준비
    Dough mockDough = new MockThinDough();
    Cheese mockCheese = new MockCheese();

    // 생성자를 통해 가짜 객체를 주입하여 APizza 독립 테스트 가능!
    APizza pizza = new APizza(mockDough, mockCheese, new ArrayList<>());
    
    // ... 검증 로직 ...
}
```


## 🌱 Spring Container (ApplicationContext)
**스프링 컨테이너(Spring Container)** 는 스프링 프레임워크의 핵심으로 **자바 객체(빈)의 생성, 초기화, 보관, 제거 등 생명주기를 관리하는 역할**을 합니다.
이러한 스프링 컨테이너를 구현하는 대표적인 인터페이스가 바로 **`ApplicationContext`** 입니다.

### BeanFactory
BeanFactory는 스프링 컨테이너의 최상위 인터페이스로 스프링 빈을 생성하고 관리하는 역할을 담당합니다.

### 📌 ApplicationContext 핵심 역할과 기능
`ApplicationContext`는 스프링 IoC(제어의 역전) 컨테이너의 최상위 인터페이스인 `BeanFactory`를 상속받아 빈 관리 기능 외에 애플리케이션을 위한 다양한 부가 기능을 제공합니다.

| **기능** | **설명** |
| ---- | ---- |
| **Bean 객체 관리** | 스프링 컨테이너의 가장 기본적인 역할입니다. 싱글톤 레지스트리로서 자바 객체(빈)의 생성, 의존성 조립(DI), 그리고 생명주기를 전담하여 관리합니다. |
| **메시지 리소스 처리(MessageSource)** | 한국어, 영어 등 사용자의 접속 지역 환경에 맞춰 메시지를 다국어로 렌더링해 주는 기능을 지원합니다. |
| **환경 변수 관리(EnvironmentCapable)** | 로컬(`local`), 개발(`dev`), 운영(`prod`) 등 실행 환경을 명확하게 분리하고 `application.yml`이나 OS 시스템의 프로퍼티 값을 일관된 방식으로 관리 |
| **애플리케이션 이벤트 발행** | 도메인 모듈 간의 결합도를 낮추기 위해 이벤트를 발행하고 구독(Pub/Sub)할 수 있는 옵저버 패턴 기반의 내부 이벤트 시스템을 제공합니다. |
| **리소스 조회(ResourceLoader)** | 파일 시스템, 클래스패스(classpath), 외부 URL 등 다양한 물리적 경로에 위치한 외부 리소스(파일, 템플릿 등)를 일관된 추상화 방식으로 읽어옵니다. |

### 🧑‍💻 자주 사용하는 구현체
설정 정보를 읽어오는 방식에 따라 ApplicationContext의 구현 클래스가 나뉩니다.
#### AnnotationConfigApplicationContext
자바 애노테이션(`@Configuration`, `@Component`) 기반의 설정 정보를 읽어와 컨테이너를 구동합니다.
내부적으로 웹 환경에 맞게 확장된 `AnnotationConfigServletWebServerApplicationContext`를 구동해 내장 톰캣(Tomcat)과 스프링 컨테이너를 한 번에 띄웁니다.
```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class)
```


#### ClassPathXmlApplicationContext
클래스패스에 위치한 XML 파일(`applicationContext.xml` 등)을 설정 정보로 읽어 컨테이너를 구동합니다.

#### FileSystemXmlApplicationContext
파일 시스템 경로에 있는 XML 설정 파일을 직접 지정하여 구동합니다.

### 🆚 ApplicationContext vs BeanFactory

| **기능** | **BeanFactory** | **ApplicationContext** |
| ---- | ---- | ---- |
| **정의** | 스프링 컨테이너의 최상위 루트 인터페이스 | `BeanFactory`를 상속받아 기능을 확장한 인터페이스 |
| **역할** | 빈 생성, 의존성 주입 등 DI 컨테이너의 가장 기본 역할만 수행 | 빈 관리, 환경변수/이벤트/다국어 등 필요한 모든 부가 기능 제공 |
| **빈(Bean) 로딩 방식** | 지연 로딩 (Lazy-Loading). 클라이언트가 해당 빈을 실제 사용할 때(`getBean()` 호출) 객체를 생성 | 즉시 로딩 (Eager-Loading). 서버가 구동되는 시점에 모든 싱글톤 빈을 한꺼번에 미리 생성하여 메모리에 올려둠 |

## 📚 Ref.
<span class="inline-link" data-url="https://docs.spring.io/spring-framework/reference/core/beans.html" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://www.youtube.com/watch?v=8lp_nHicYd4" data-domain="youtube.com"></span>
<span class="inline-link" data-url="https://www.youtube.com/watch?v=NOAajiABq6A" data-domain="youtube.com"></span>
<span class="inline-link" data-url="https://medium.com/@gaddamnaveen192/how-i-solved-circular-dependency-headaches-in-springboot-9e1519f8f5b1" data-domain="medium.com"></span>

