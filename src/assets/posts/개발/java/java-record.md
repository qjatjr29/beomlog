---
id: "365d67b9-9e80-8096-a9f3-d2580b037b92"
title: "Java Record"
slug: "java-record"
category: "개발"
tags: ["Record"]
date: "2026-05-19"
createdAt: "2026-05-19T06:01:00.000Z"
excerpt: "Java Record란 무엇인가? Java 14에서 등장하여 Java 16에서 정식 스펙이 된 Record는 \"불변(Immutable) 데이터 전달 객체(DTO)\"를 간결하게 간결..."
thumbnail: ""
groupId: "364d67b9-9e80-8029-8cab-f5b0a3f733f3"
groupSlug: "java"
lastEdited: "2026-05-19T06:01:00.000Z"
---

## Java Record란 무엇인가?
`Java 14`에서 등장하여 `Java 16`에서 정식 스펙이 된 <span class="text-red">**Record**</span>는 "**불변(Immutable) 데이터 전달 객체(DTO)**"를 간결하게 간결하고 명확하게 정의하기 위해 도입된 특수한 형태의 클래스입니다.

> 🚀 **반복적인 보일러플레이트 코드**(생성자, 접근자, equals, hashCode 등)을 `컴파일러`가 대신 생성해주어 개발자가 순수하게 <u>**데이터 전달**</u>이라는 목적에만 집중할 수 있도록 설계되었습니다.

### 목적
일반적으로 데이터베이스의 결과나 쿼리 결과 등 **단순 데이터를 담기위해서 클래스**를 사용했습니다.
이 데이터들은 대부분 <span class="text-red">**불변성**</span>으로 동기화 없이도 데이터의 유효성을 보장합니다.
- 객체를 한 번 생성하면 값을 변경할 수 없게 만들면 여러 스레드가 동시에 접근하더라도 값이 중간에 바뀌지 않아 동기화 처리가 필요없이 항상 일관된 상태를 유지할 수 있다는 의미.
이를 위해  `private` 필드를 선언하고 생성자, Getter, `equals()`, `hashCode()`, `toString()` 등 처리를 한 데이터 클래스를 생성합니다.
```java
public class Person {

    private final String name;
    private final String address;

    public Person(String name, String address) {
        this.name = name;
        this.address = address;
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, address);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        } else if (!(obj instanceof Person)) {
            return false;
        } else {
            Person other = (Person) obj;
            return Objects.equals(name, other.name)
              && Objects.equals(address, other.address);
        }
    }

    @Override
    public String toString() {
        return "Person [name=" + name + ", address=" + address + "]";
    }

    // standard getters
}
```

이 방법은 **2가지 문제**가 있습니다.
1. 많은 **보일러플레이트(반복)** 코드가 존재
2. 클래스의 본래 **목적**이 흐려져 잘 드러나지 않는다.
  - ex) `Person = 이름과 주소등 사람을 표현하는 객체`
  - 하지만 Getter, 생성자, equals 와 같은 코드로 구성되어 한눈에 표현이 안됌.
## Record 타입
`JDK 14`부터 반복되는 데이터 클래스를 레코드로 대체할 수 있습니다.
**레코드는 필드의 타입과 이름만 필요로하는 **<span class="text-blue">**변경이 불가능한 데이터 클래스**</span>**입니다.**
`equals`, `hashCode`, `toString` 메서드뿐 아니라 `private`, `final fields`, `public constructor` 는 자바 컴파일러에 의해 생성이 됩니다.
```java
public record Person (String name, String address) {}
```

### Record 특징

| **특징** | **설명** |
| ---- | ---- |
| **불변성** | 모든 필드는 묵시적으로 <span class="text-blue">**private fina**</span>l로 객체 생성 이후 값을 변경할 수 없습니다. (Setter 없음) |
| **상속 불가** | **final** 클래스이므로 다른 클래스를 상속받거나 상속해줄 수 없습니다.(`interface` 구현은 가능) |
| **보일러플레이트 자동 생성** | 필드에 대한 기본 생성자, equals, hashCode, toString을 컴파일러가 자동 생성합니다. |
| **Getter 네이밍** | 필드명과 동일한 `name()` 형태로 값을 반환합니다. (getName()이 아님) |

### Constructor (생성자)
Record를 사용해 각 필드에 대해 인자를 가진 공개 생성자가 생성됩니다ㅏ.
```java
Person person = new Person("Beomsic", "Seoul");
```

### Getter
필드 이름과 일치하는 Getter도 생성해줍니다.
```java
Person person = new Person("Beomsic", "Seoul");

person.name();
person.address();
```

## ⚠️ Record 사용시 주의할 점
**Record**는 `데이터 전달`이라는 목적에는 부합하지만 기존 자바 생태계를 사용하는 **프레임워크**나 **라이브러리**들과 결합할 때는 주의가 필요합니다.
### 1️⃣ JPA Entity로의 사용 금지
`record`를 JPA의 `@Entity`로 사용하는 것은 대표적인 안티 패턴입니다.
> **JPA는 지연로딩을 위해 엔티티를 상속받아 프록시 객체를 만듭니다.** 

하지만 Record는 모든 필드가 `final`로 프록시 객체 생성이 불가능합니다.
> **JPA는 리플렉션을 통해 객체를 생성할 때 기본 생성자를 요구합니다.** 

하지만 Record는 필드가 비어있는 기본 생성자를 제공해주지 않습니다.
JPA 엔티티는 영속성 컨텍스트에 의해 관리되며 조회 이후에도 필드 값이 변경될 수 있어야 합니다(`Dirty Checking`). 
하지만 Record는 모든 필드가 `final`인 불변 객체로 생성 이후 상태 변경이 불가능합니다. 
### 2️⃣ JPA 조회용 DTO로 사용시 한계
엔티티 대신 Record를 조회용 DTO로 사용을 할 때도 한계가 존재합니다.
JPQL에서 Record로 결과를 반환받으려면 `new` 연산자와 함께 클래스의 전체 패키지 경로를 적어주어야 합니다.
```java
com.company.project.domain.dto.Person(p.name, p.address) FROM Person p
```

- 이는 개발자가 오타를 작성할 수도 있고 유지보수 과정에서 에러가 발생할 수 있습니다.
SQL 조회 결과의 컬럼 순서와 Record 생성자의 **매개변수 순서가 하나라도 다를 시** 에러가 발생합니다.
- 필드명을 기준으로 유연하게 매핑하지 못합니다.
## 📚 Ref.
<span class="inline-link" data-url="https://openjdk.org/jeps/359" data-domain="openjdk.org"></span>
<span class="inline-link" data-url="https://www.baeldung.com/java-record-keyword" data-domain="baeldung.com"></span>
