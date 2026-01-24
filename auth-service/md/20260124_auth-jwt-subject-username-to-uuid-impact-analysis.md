# JWT Subject 변경 영향도 분석 보고서

> **작성일**: 2026-01-24
> **목적**: JWT subject를 `username`에서 `member_uuid`로 변경 시 영향 범위 파악
> **분석 대상**: Auth-Service 전체 코드

---

## 1. 현재 JWT 구조 분석

### 1.1 현재 토큰 생성 방식 (JwtTokenProvider)

| 토큰 타입 | subject (sub) | claims |
|-----------|---------------|--------|
| Access Token (User) | `username` (email) | uuid, role, type="access" |
| Refresh Token (User) | `username` | uuid, type="refresh" |
| Admin Token | `username` | uuid, role="ADMIN", type="ADMIN_LOGIN" |

### 1.2 핵심 포인트
- **현재**: JWT subject에 `username`을 사용하고, `uuid`는 별도 claim으로 저장
- **목표**: JWT subject를 `uuid`로 변경하여 인증 흐름의 primary identifier를 uuid 기반으로 전환

---

## 2. 영향 받는 파일 및 메서드 분석

### 2.1 JWT 핵심 파일 (필수 수정)

#### 📁 `security/jwt/JwtTokenProvider.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 58-69 | `generateAccessToken(String username, String role, String uuid)` | `setSubject(username)`으로 username을 subject에 설정, uuid는 claim으로 저장 | `setSubject(uuid)`로 변경, username을 claim으로 이동 | **필수** |
| 74-84 | `generateRefreshToken(String username, String uuid)` | `setSubject(username)`으로 username을 subject에 설정 | `setSubject(uuid)`로 변경, username 제거 또는 claim으로 이동 | **필수** |
| 89-102 | `generateAdminToken(String uuid, String username)` | `setSubject(username)`으로 username을 subject에 설정 | `setSubject(uuid)`로 변경 | **필수** |
| 146-148 | `getUsernameFromToken(String token)` | `getClaims(token).getSubject()`로 username 추출 | uuid 추출로 변경하거나 메서드명 변경 (`getUuidFromToken`과 역할 재정의) | **필수** |
| 175-190 | `getAuthentication(String token)` | `getUsernameFromToken()`으로 username 추출 후 `CustomUserPrincipal` 생성 | subject에서 uuid를 추출하고, username은 claim 또는 DB 조회로 처리 | **필수** |

---

#### 📁 `security/CustomUserPrincipal.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 13-17 | Constructor | `username`, `uuid`, `authorities`를 받아 저장 | username 파라미터 유지 (하위 호환) 또는 uuid만으로 생성 가능하도록 변경 | **확인** |
| 24-26 | `getUsername()` | Spring Security `UserDetails` 인터페이스 구현, username 반환 | 인터페이스 요구사항이므로 유지, 내부 구현만 검토 | 영향 없음 |
| 19-21 | `getUuid()` | uuid 반환 | 변경 없음 | 영향 없음 |

---

#### 📁 `security/SecurityUtils.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 8-20 | `getCurrentUserUuidOrThrow()` | `CustomUserPrincipal`에서 `getUuid()` 호출 | 변경 없음 (이미 uuid 기반) | 영향 없음 |

---

### 2.2 인증/토큰 발급 서비스 (필수 수정)

#### 📁 `service/AuthService.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 47-65 | `login(LoginRequest request)` | `jwtTokenProvider.generateAccessToken(member.getUsername(), ...)` 호출 | 파라미터 순서 또는 시그니처 변경에 맞춰 수정 | **필수** |
| 58 | - | `generateAccessToken(member.getUsername(), member.getRole().name(), member.getUuid())` | uuid를 첫 번째 파라미터로 변경 | **필수** |
| 59 | - | `generateRefreshToken(member.getUsername(), member.getUuid())` | uuid를 첫 번째 파라미터로 변경 | **필수** |

---

#### 📁 `service/admin/AdminAuthService.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 40 | `login(AdminLoginRequest request)` | `jwtTokenProvider.generateAdminToken(member.getUuid(), member.getUsername())` | 시그니처 변경에 맞춰 수정 | **필수** |

---

#### 📁 `service/KakaoAuthService.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 65-68 | `processKakaoLogin()` | `generateAccessToken(member.getUsername(), member.getRole().name(), member.getUuid())` | 파라미터 순서 변경 | **필수** |
| 71-74 | - | `generateRefreshToken(member.getUsername(), member.getUuid())` | 파라미터 순서 변경 | **필수** |

---

#### 📁 `service/KakaoSignupService.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 76-80 | `signupNewMember()` | `generateAccessToken(member.getUsername(), ...)` | 파라미터 순서 변경 | **필수** |
| 82-85 | - | `generateRefreshToken(member.getUsername(), member.getUuid())` | 파라미터 순서 변경 | **필수** |

---

### 2.3 컨트롤러 (확인 필요)

#### 📁 `controller/AuthController.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 141-151 | `getCurrentUser()` | `CustomUserPrincipal.getUuid()`로 uuid 추출하여 Member 조회 | 변경 없음 (이미 uuid 기반) | 영향 없음 |
| 169-224 | `refresh()` | `getClaims(refreshToken).get("uuid", String.class)`로 uuid 추출 | 변경 후 `getSubject()`로 uuid 추출하도록 수정 | **필수** |
| 193-198 | - | `generateAccessToken(member.getUsername(), ...)`, `generateRefreshToken(...)` 호출 | 파라미터 변경에 맞춰 수정 | **필수** |

---

#### 📁 `controller/admin/AdminAuthController.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 146-166 | `getAdminInfo()` | `authentication.getName()`으로 username 추출하여 응답 | subject가 uuid로 변경되면 `getName()`이 uuid를 반환하므로 응답 데이터 검토 필요 | **확인** |

---

### 2.4 OAuth2 관련 (확인 필요)

#### 📁 `security/oauth/CustomOAuth2User.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 17-33 | Constructor | `username`, `uuid`, `role`, `member` 저장 | JWT subject 변경과 직접적 관련 없음 | 영향 없음 |

---

#### 📁 `service/CustomOAuth2UserService.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 43-51 | `loadUser()` | `member.getUsername()`을 `CustomOAuth2User`에 전달 | JWT 생성과 무관, OAuth2 flow만 담당 | 영향 없음 |

---

### 2.5 DTO 클래스 (영향 없음)

#### 📁 `dto/MemberDTO.java`

| 라인 | 필드/메서드 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|------------|---------------|-------------|----------------|
| 29, 58 | `username` 필드 | `member.getUsername()` 사용 | Member 엔티티에서 직접 조회, JWT 변경과 무관 | 영향 없음 |

---

#### 📁 `dto/LoginRequest.java`, `dto/SignUpRequest.java`, `dto/admin/AdminLoginRequest.java`

| 파일 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|---------------|-------------|----------------|
| LoginRequest | username, password 필드 | 로그인 요청 DTO, JWT 생성 로직과 무관 | 영향 없음 |
| SignUpRequest | username, password, nickname, email 필드 | 회원가입 요청 DTO | 영향 없음 |
| AdminLoginRequest | username, password, captchaToken 필드 | 관리자 로그인 요청 DTO | 영향 없음 |

---

### 2.6 Repository (영향 없음)

#### 📁 `repository/MemberRepository.java`

| 라인 | 메서드명 | 현재 동작 방식 | 변경 포인트 | 수정 필요 여부 |
|------|----------|---------------|-------------|----------------|
| 18 | `findByUsername(String username)` | username으로 Member 조회 | 로그인 시 사용, JWT subject 변경과 무관 | 영향 없음 |
| 29 | `findByUuid(String uuid)` | uuid로 Member 조회 | 이미 사용 중, 변경 후 더 활발히 사용될 수 있음 | 영향 없음 |

---

### 2.7 엔티티 (영향 없음)

#### 📁 `entity/Member.java`

| 필드 | 현재 상태 | 변경 포인트 | 수정 필요 여부 |
|------|----------|-------------|----------------|
| `username` | 유지 (unique, not null) | 필드 자체는 유지, JWT에서만 역할 축소 | 영향 없음 |
| `uuid` | 유지 (unique, not null) | JWT subject로 승격 | 영향 없음 |

---

## 3. 수정 범위 요약

### 3.1 필수 수정 파일 (7개)

| 파일 | 수정 사항 |
|------|----------|
| `JwtTokenProvider.java` | `setSubject(uuid)` 변경, 메서드 시그니처 검토 |
| `AuthService.java` | 토큰 생성 호출부 파라미터 조정 |
| `AdminAuthService.java` | 토큰 생성 호출부 파라미터 조정 |
| `KakaoAuthService.java` | 토큰 생성 호출부 파라미터 조정 |
| `KakaoSignupService.java` | 토큰 생성 호출부 파라미터 조정 |
| `AuthController.java` | refresh 로직에서 uuid 추출 방식 변경 |
| `AdminAuthController.java` | `getAdminInfo()` 응답 검토 |

### 3.2 확인 필요 파일 (2개)

| 파일 | 확인 사항 |
|------|----------|
| `CustomUserPrincipal.java` | 생성자 호출부와 일관성 검토 |
| `AdminAuthController.java` | `authentication.getName()` 반환값 검토 |

### 3.3 영향 없는 파일 (다수)

- DTO 클래스들 (LoginRequest, SignUpRequest, MemberDTO 등)
- Repository 인터페이스
- Entity 클래스 (Member, RefreshToken)
- SecurityConfig
- OAuth2 관련 클래스 (JWT 생성과 무관)

---

## 4. 권장 리팩토링 순서

### Phase 1: JwtTokenProvider 핵심 변경
1. `generateAccessToken()` 시그니처 변경: `(String uuid, String role, String username)` 또는 `(String uuid, String role)`
2. `generateRefreshToken()` 시그니처 변경: `(String uuid)` 또는 `(String uuid, String username)`
3. `generateAdminToken()` 시그니처 확인
4. `setSubject(username)` → `setSubject(uuid)` 변경
5. username을 claim으로 이동 (선택적)
6. `getUsernameFromToken()` → `getSubjectFromToken()` 또는 `getUuidFromSubject()` 로 명확히 변경

### Phase 2: 서비스 레이어 호출부 수정
1. `AuthService.login()` 호출부 수정
2. `AdminAuthService.login()` 호출부 수정
3. `KakaoAuthService.processKakaoLogin()` 수정
4. `KakaoSignupService.signupNewMember()` 수정

### Phase 3: 컨트롤러 수정
1. `AuthController.refresh()` uuid 추출 로직 변경
2. `AdminAuthController.getAdminInfo()` 응답 검토

### Phase 4: 테스트 및 검증
1. 기존 JWT 토큰과의 하위 호환성 검토 (기존 발급 토큰 처리 방안)
2. 단위 테스트 수정
3. 통합 테스트 검증

---

## 5. 주의 사항

### 5.1 하위 호환성
- **기존 발급된 JWT 토큰**: subject가 username인 토큰이 이미 발급되어 사용 중일 수 있음
- **권장**: 마이그레이션 기간 동안 두 가지 subject 형식 모두 처리 가능하도록 fallback 로직 추가

### 5.2 Spring Security 통합
- `Authentication.getName()`은 `UserDetails.getUsername()`을 반환
- `CustomUserPrincipal.getUsername()` 구현이 어떤 값을 반환하느냐에 따라 `authentication.getName()` 결과가 달라짐
- 필요 시 `getUsername()`이 uuid를 반환하도록 변경하거나, 별도 메서드로 구분

### 5.3 타 서비스와의 연동
- 다른 마이크로서비스에서 JWT를 파싱하여 subject를 사용하는 경우 동시 배포 필요
- Gateway, Post-Service 등 JWT 검증/파싱 로직 확인 필요

---

## 6. 결론

JWT subject를 `username`에서 `uuid`로 변경하는 작업은 **핵심 인증 로직에 집중된 변경**이며, 전체 수정 범위는 비교적 명확합니다.

- **필수 수정**: 7개 파일
- **확인 필요**: 2개 파일
- **영향 없음**: 다수의 DTO, Entity, Repository

리팩토링 시 **JwtTokenProvider를 먼저 수정**하고, 이를 호출하는 서비스 → 컨트롤러 순서로 진행하는 것을 권장합니다.
