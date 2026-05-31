---
id: "36fd67b9-9e80-80eb-9a71-fcdd85289ca5"
title: "Spring Boot 등장과 Auto-configuration"
slug: "spring-boot-등장과-auto-configuration"
category: "개발"
tags: ["SpringBoot","Auto-Configuration"]
date: "2026-05-28"
dateEnd: ""
createdAt: "2026-05-29T03:55:00.000Z"
excerpt: "🌱 Spring Boot 등장 ⚠️ 기존 Spring의 문제점 (Spring Boot 이전) Spring 애플리케이션을 시작하려면 해야하는 설정이 너무 많아지고 복잡해졌습니다. ..."
thumbnail: "https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F07f14736-dde0-4626-a298-5745221f7162%2Fimage.png?table=block&id=36fd67b9-9e80-8073-aedc-d034f40cd651&cache=v2"
groupId: "36fd67b9-9e80-80ae-a9ff-d6264af85293"
groupSlug: "spring-boot"
lastEdited: "2026-05-29T03:56:00.000Z"
---

## 🌱 Spring Boot 등장
### ⚠️ 기존 Spring의 문제점 (Spring Boot 이전)
Spring 애플리케이션을 시작하려면 해야하는 설정이 너무 많아지고 복잡해졌습니다.
### 💡 Spring Boot
> Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can "just run".
> We take an opinionated view of the Spring platform and third-party libraries so you can get started with minimum fuss. Most Spring Boot applications need minimal Spring configuration
> - 스프링 부트 공식 홈페이지

이처럼 <span class="text-green">**Spring Boot**</span>는 스프링을 이용한 **개발에 필요한 복잡한 설정을 해주고 기본값을 제공하여 빠르게 애플리케이션을 구축하는데 도움을 주어** 개발자는 즉시 애플리케이션 개발을 시작할 수 있습니다.
### Spring Boot의 핵심 설계 철학

| **핵심 철학** | **상세 개념** | 장점 |
| ---- | ---- | ---- |
| **Convention over Configuration**
(설정보다 관례) | 개발자가 특별히 설정을 커스텀하지 않는다면 시장 표준에 맞는 가장 합리적인 기본 설정을 애플리케이션에 자동으로 적용합니다. | 불필요한 보일러플레이트 XML/자바 설정 코드가 제거됨. |
| **Opinionated Defaults**
(기본값) | 스프링 팀이 검증한 최적의 라이브러리 세트와 버전을 프레임워크가 주관적으로 선택하여 기본 제공합니다. | 개발자가 직접 버전 호환성을 해결하지 않아도 됨. |
| **Standalone**
(독립 실행형) | 외부 웹 애플리케이션 서버(WAS) 환경에 의존하지 않고 내장 웹 서버를 탑재하여 단독 구동이 가능합니다. | 배포 파일 아키텍처가 단순해지며 구동 환경 제어가 극도로 쉬워짐. |

## 🚀 Spring Boot 이점
### 😸 내장 서버 (Embedded Server)
#### Spring Boot 없이 웹 애플리케이션을 배포하기 위해서는?
```plain text
코드 개발 → .war 빌드 → 외부 Tomcat WAS 별도 설치 → webapps 폴더에 war 이동 → Tomcat 구동
```

⚠️ 이때, **개발 환경과 운영 환경의 Tomcat 버전의 불일치 문제**가 발생할 수도 있습니다.

#### 스프링 부트는 **톰캣(Tomcat)을 프로젝트의 내부 라이브러리로 포함**해 버리는 내장 서버 메커니즘을 제공합니다.
- `war` 가 아닌 `jar` 파일로 패키징을 합니다.
- 외부 서버 설치 없이 내장된 메인 메서드를 통해 **어디서나 동일한 환경으로 즉시 구동**
```plain text
코드 빌드 → .jar 파일 생성 → java -jar app.jar 명령어로 즉시 실행 (Tomcat 내장)
```


### ☑️ 편리한 의존성과 권장 버전 관리
스프링 부트 전에는 개발을 한 번 시작하기 위해서는 많은 것들을 설정해줘야 했습니다.
- 어떤 **라이브러리**들을 사용할지 (Spring webMVC, tomcat, Json 처리 등등)
- 각 라이브러리의 **버전**도 선택
- 라이브러리 버전끼리 서로 **호환**이 되는지도  확인
```groovy
dependencies {
    implementation 'org.springframework:spring-webmvc:6.1.3'
    implementation 'org.springframework:spring-context:6.1.3'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.16.1'
    // ...
}
```


#### Spring Boot는 라이브러리를 관리하는 편리한 툴들을 제공합니다.
```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.0'
    id 'io.spring.dependency-management' version '1.1.5'
}

// ...

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

:::callout 💡 **Spring Boot는 라이브러리의 버전 관리를 돕습니다.**
:::callout - `spring.dependency-management` 플러그인을 추가하면 버전을 생략할 수 있습니다.

:::callout 💡 **Spring Boot는 기본 라이브러리 묶음을 제공합니다.**
:::callout - `spring-boot-starter-web`: 스프링 MVC, 내장 톰캣 등
:::callout - `spring-boot-starter-jdbc`: JDBC, HikariCP 커넥션 풀 등
:::callout - `spring-boot-starter-data-jpa`: Spring Data JPA, Hibernate, JDBC 등
🚀 이렇게 **스프링 부트**덕에 개발자들은 라이브러리를 훨씬 더 쉽게 관리할 수 있게 되었습니다.

#### 🤔 `dependency-management` 플러그인은 어떻게 버전을 생략해 줄까?
플러그인이 스프링 부트가 관리하는 최적의 **라이브러리 버전 명세서(BOM)**를 미리 다운로드하여 백그라운드에 쥐고 있기 때문에 버전을 적지 않아도 됩니다.

🐘 **build.gradle 실행**
1. `org.springframework.boot` 플러그인이 현재 부트 버전(예: 4.0.3)을 인식
2. `dependency-management` 플러그인이 부트 버전에 맞는 'BOM(버전 명세서)'을 자동 밀어넣기 (`spring-boot-dependencies-4.0.3.pom`)
3. 개발자가 `spring-boot-starter-web` 선언(버전 없이)
4. 플러그인의 인터셉트 → “잠시만, 버전이 비어있네? 명세서에서 찾아 매핑해 줄게!”
5. 최종 결과: `org.springframework.boot:spring-boot-starter-web:4.0.3` 지정

**동작 원리**
- 플러그인이 내부적으로 `spring-boot-dependencies`라는 특별한 **POM** 파일을 가져옵니다. 
- 이 파일 안에는 스프링 생태계뿐만 아니라 `Jackson`, `Hibernate`, `Tomcat` 등 수백 개 오픈소스 라이브러리의 "가장 안정적인 조합 버전"이 하드코딩되어 있습니다.
- 개발자가 버전을 생략하면 플러그인이 **Gradle의 의존성 확인** 단계에 개입하여 명세서에 적힌 버전을 자동으로 채워 넣습니다. (라이브러리 간 버전 충돌 해결)
### 🌠 자동 구성(Auto-configuration)
> 일반적으로 자주 사용하는 수 많은 **빈**들을 <span class="text-red">**자동으로 등록**</span>해주는 기능
> - ex) **JdbcTemplate, DataSource, TransactionManager 등**

**애플리케이션에 추가된 라이브러리와 클래스 경로를 분석해 자주 사용되는 빈들을 자동으로 등록하고 초기화합니다.**
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F07f14736-dde0-4626-a298-5745221f7162%2Fimage.png?table=block&id=36fd67b9-9e80-8073-aedc-d034f40cd651&cache=v2" alt="image" width="1252" height="1030" loading="lazy" />

**Spring Boot가 등록해주는 빈**들은 이런 `spring-boot-autoconfigure` 라는 모듈을 통해서 확인할 수 있습니다.
#### JDBC Template AutoConfiguration 예시
```java
@AutoConfiguration(
    after = {DataSourceAutoConfiguration.class}
)
@ConditionalOnClass({DataSource.class, JdbcTemplate.class})
@ConditionalOnSingleCandidate(DataSource.class)
@EnableConfigurationProperties({JdbcProperties.class})
@Import({DatabaseInitializationDependencyConfigurer.class, JdbcTemplateConfiguration.class, NamedParameterJdbcTemplateConfiguration.class})
public final class JdbcTemplateAutoConfiguration {
    public JdbcTemplateAutoConfiguration() {
    }
}

-----------------------

@Configuration(proxyBeanMethods = false)
@ConditionalOnMissingBean({JdbcOperations.class})
class JdbcTemplateConfiguration {
    JdbcTemplateConfiguration() {}

    @Bean
    @Primary
    JdbcTemplate jdbcTemplate(DataSource dataSource, JdbcProperties properties, ObjectProvider<SQLExceptionTranslator> sqlExceptionTranslator) {
        // ...
    }
}
```

**`@AutoConfiguration`**** : 스프링 부트가 관리하는 자동 구성 클래스임을 선언**

### 💡스프링 부트 4의 거대한 자동 구성 모듈 해체 아키텍처
#### ⚠️ 과거 버전에서의 문제
스프링 부트가 지원하는 기술이 늘어나면서 **자동 구성 모듈도 점점 커져갔습니다.**
하나의 거대한 `spring-boot-autoconfigure.jar` 파일 안에 JPA, Redis, RabbitMQ, Web 등 모든 기술의 자동 설정 클래스들이 밀집해 있었습니다. 
내 프로젝트에서 Redis를 쓰지 않더라도 관련 설정 정보들이 런타임에 불필요하게 메모리에 올라가거나 스캔 대상이 되어 **서버 구동 시간(Startup Time)**과 **메모리**상에 손해를 보았습니다.
이를 해결하기 위해 **스프링 부트 4**는 기존의 단일 자동 구성 모듈을 잘게 쪼개 여러 개의 작은 모듈로 분리하는 **구조적 해체 작업**을 단행했습니다.
<figure>
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F7f823b42-35ef-4d52-9912-59c554aaec5f%2Fimage.png?table=block&id=36fd67b9-9e80-802b-8056-f9909a83e82d&cache=v2" alt="별도 Spring Data JPA 자동 구성 모듈" width="882" height="384" loading="lazy" />
<figcaption>별도 Spring Data JPA 자동 구성 모듈</figcaption>
</figure>


🚀 **결과:** 필요한 의존성을 추가할 때만 딱 그 기술에 대응하는 조그만 자동 구성 모듈이 포함되므로 불필요한 속성 노출이 사라지고 **애플리케이션 시작 속도가 획기적으로 빨라졌으며 메모리 효율 향상**.
## 🧑‍💻 @SpringBootApplication
```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = {@Filter(type = FilterType.CUSTOM, classes = {TypeExcludeFilter.class}), @Filter(
    type = FilterType.CUSTOM,
    classes = {AutoConfigurationExcludeFilter.class}
)} )
public @interface SpringBootApplication {
```

`@SpringBootApplication` 은 3가지 어노테이션을 가지고 있습니다.
- `@Configuration`
- `@EnableAutoConfiguration`
- `@ComponentScan`

이중 자동 구성 클래스들이 런타임에 동적으로 선택되어 로딩되는 것과 관련된 어노테이션은 `@EnableAutoConfiguration` 입니다.
### ✅ `@EnableAutoConfiguration`
스프링 부트 애플리케이션이 실행될 때 **클래스 패스(Classpath)에 추가된 외부 라이브러리**와 현재 **프로젝트의 의존성**을 바탕으로 필요한 설정 클래스들을 찾아내어 자동으로 스프링 컨테이너에 등록하도록 하는 시작입니다.
보통 개발자가 직접 명시하기보다는 `@SpringBootApplication` 내부에 포함되어 실행됩니다.
```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import({AutoConfigurationImportSelector.class})
public @interface EnableAutoConfiguration {
    // ... 
}
```


#### ⚙️ `@Import`와 `ImportSelector`
스프링에서 설정 파일(`@Configuration`)을 컨테이너로 가져오는 방식은 크게 두 가지로 나뉩니다.

| **방식** | **설명** | **용도** |
| ---- | ---- | ---- |
| **`@Import`** | 로딩할 클래스를 소스 코드에 직접 명시하는 **정적**인 방식 | 개발자가 직접 만든 고정된 스프링 설정 정보(`@Configuration` 클래스 등)를 명시적으로 불러와 빈으로 등록할 때 주로 사용 |
| **`ImportSelector`** 인터페이스 | 런타임에 로딩할 클래스 이름들을 코드로 계산하여 반환하는 **동적**인 방식 | 클래스패스의 상태(어떤 라이브러리가 있는지)나 설정값에 따라 빈으로 등록할 설정 클래스들을 유연하고 동적으로 결정해야 할 때 사용 |

스프링 부트 프레임워크 입장에서는 개발자가 프로젝트에 어떤 외부 라이브러리(JPA, Redis, Kafka 등)를 추가할지 미리 알 수 없습니다. 
따라서 고정된 방식인 `@Import({JpaConfig.class, RedisConfig.class})`처럼 코드를 하드코딩해 둘 수 없어 스프링 부트는 **`@Import({AutoConfigurationImportSelector.class})`** 형태로 `ImportSelector` 인터페이스의 구현체를 주입하는 방식을 선택했습니다.

### 📌 `AutoConfigurationImportSelector`
> 애플리케이션의 클래스 경로에서 필요한 자동 구성 클래스를 선택하는 기능을 제공하는 `ImportSelector` 인터페이스를 구현한 클래스입니다.


**AutoConfiguration의 후보들과 Conditional을 통해서 특정 빈이 등록할 수 있는 조건에 따라 필터링을 하고 그 대상을 반환합니다.**
#### 1️⃣ 후보 클래스 로드
`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 파일에 등록된 후보 클래스들의 목록을 읽어옵니다.
<figure>
<img src="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fce63075d-cee3-44a7-8d31-efcf5784b0e7%2F5db4166e-24ce-4891-b566-f8211d04512f%2Fimage.png?table=block&id=36fd67b9-9e80-8033-a32b-cdca9a9a1754&cache=v2" alt="자동 설정 클래스 이름이 문자열 줄바꿈으로 나열되어 있음." width="1108" height="296" loading="lazy" />
<figcaption>자동 설정 클래스 이름이 문자열 줄바꿈으로 나열되어 있음.</figcaption>
</figure>

#### 2️⃣ 중복 제거 및 제외 대상 필터링
가져온 리스트에서 중복을 제거하고 개발자가 애플리케이션 구동시 의도적으로 빼달라고 한 요청한 설정들을 후보에서 제외합니다.
- 예: `@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)` 라고 적었다면 해당 클래스는 이 단계에서 명단에서 제외
#### 3️⃣ 조건 검사 (AutoConfigurationImportFilter)
후보 클래스들이 메모리에 로드되거나 무거운 @Conditional 조건 평가를 하기전 빠르게 필터링을 수행해 초기화 시간을 단축합니다.
- 클래스를 메모리에 로딩하지 않고도 **`@ConditionalOnClass`**** (해당 라이브러리가 존재하는가?)**, **`@ConditionalOnWebApplication`**** (웹 환경인가?)** 같은 가벼운 조건들을 **사전 검사**합니다.
- ex) 클래스 패스에 `Kafka` 라이브러리가 없으면 `KafkaAutoConfiguration`은 스프링 컨테이너에 도달전 명단에서 제외됩니다.
#### 3️⃣ 최종 후보군 반환
필터링이 완료된 최종 클래스 이름 배열을 **스프링 컨테이너**로 반환합니다.
#### 4️⃣ 조건부 평가(@Conditional) 및 빈 등록
> 여기서부터는 **스프링 컨테이너**가 처리합니다.

컨테이너는 건네받은 후보 명단의 클래스들을 하나씩 메모리에 올리면서 내부에 붙어있는 `@ConditionalOnClass`, `@ConditionalOnMissingBean` 등의 조건을 판단합니다.
조건이 충족하지 않는다면 빈 등록을 하지 않고 조건에 맞다면 스프링 빈으로 등록합니다.
## 📚 Ref.
<span class="inline-link" data-url="https://docs.spring.io/spring-boot/" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://docs.spring.io/spring-boot/reference/using/auto-configuration.html" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://docs.spring.io/spring-boot/reference/features/developing-auto-configuration.html" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://docs.spring.io/spring-boot/api/java/org/springframework/boot/autoconfigure/EnableAutoConfiguration.html" data-domain="docs.spring.io"></span>
<span class="inline-link" data-url="https://www.youtube.com/watch?v=YdE4krx0dsM" data-domain="youtube.com"></span>
<span class="inline-link" data-url="https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide" data-domain="github.com"></span>
