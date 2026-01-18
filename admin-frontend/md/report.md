# Admin-Frontend 프로젝트 구조 분석 리포트

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트 타입** | React SPA (Single Page Application) |
| **프레임워크** | React 19.1.1 |
| **빌드 도구** | Vite 7.1.2 |
| **언어** | TypeScript 5.8.3 |
| **패키지 매니저** | npm |
| **목적** | 관리자 대시보드 애플리케이션 |

---

## 2. 디렉토리 구조

```
admin-frontend/
├── src/
│   ├── api/                    # Axios API 클라이언트 & 인터셉터
│   ├── components/
│   │   ├── common/             # 전역 UI (LoadingOverlay, ToastContainer)
│   │   ├── layout/             # 레이아웃 컴포넌트 (Header, Sidebar, AdminLayout)
│   │   └── ui/                 # 재사용 UI 컴포넌트 (버튼, 카드, 모달)
│   ├── pages/                  # 페이지 컴포넌트
│   ├── providers/              # Context 프로바이더
│   ├── router/                 # React Router 설정
│   ├── store/                  # Redux 상태 관리
│   │   └── slices/             # Redux 슬라이스
│   ├── types/                  # TypeScript 타입 정의
│   ├── utils/                  # 유틸리티 함수
│   ├── lib/                    # 라이브러리 유틸 (classname merger)
│   ├── main.tsx                # 엔트리 포인트
│   ├── App.tsx                 # 루트 컴포넌트
│   └── index.css               # Tailwind CSS 임포트
├── public/                     # 정적 자산 (파비콘, 아이콘)
├── dist/                       # 빌드 결과물
├── nginx/                      # Nginx 설정 (배포용)
├── index.html                  # HTML 템플릿
├── vite.config.ts              # Vite 설정
├── tsconfig.json               # TypeScript 설정
├── tailwind.config.js          # Tailwind CSS 설정
├── postcss.config.js           # PostCSS 설정
├── eslint.config.js            # ESLint 설정
├── Dockerfile                  # Docker 컨테이너 설정
├── package.json                # 프로젝트 의존성
└── .env files                  # 환경 변수
```

---

## 3. 주요 설정 파일

### 3.1 package.json
- **프로젝트명**: `auth-frontend` (admin 기능 수행)
- **주요 의존성**:
  - React 19.1.1 & React DOM
  - React Router v7.9.1 (라우팅)
  - Redux Toolkit 2.9.0 (상태 관리)
  - Axios 1.12.2 (HTTP 클라이언트)
  - TailwindCSS 3.4.17 (스타일링)
  - Radix UI (헤드리스 UI 라이브러리)
  - React Google reCAPTCHA v3 (로그인 보안)
  - js-cookie 3.0.5 (쿠키 관리)
  - jwt-decode 4.0.0 (JWT 토큰 파싱)
  - Lucide React (아이콘)

### 3.2 vite.config.ts
- **Base Path**: `/admin/` (EC2 배포 경로)
- **Dev Server 포트**: 5176
- **Path Aliases**: `@` → `src`, `@store` → `src/store`
- **API 프록시**: 개발 환경에서 `/api` 요청 프록시 처리

### 3.3 tailwind.config.js
- 다크 모드 지원 (class 전략)
- HSL CSS 변수 기반 커스텀 컬러 시스템
- tailwindcss-animate 플러그인 사용

---

## 4. 소스 코드 구조 상세

### 4.1 API 레이어 (`src/api/`)

| 파일 | 설명 |
|------|------|
| `axiosAuthAdmin.ts` | Auth 서비스용 Axios 인스턴스 |
| `axiosPostsAdmin.ts` | Posts/Category 서비스용 Axios 인스턴스 |
| `setupInterceptors.ts` | 전역 요청/응답 인터셉터 (로딩, 에러 처리) |
| `adminCategoryApi.ts` | 카테고리 CRUD API 함수 |

### 4.2 페이지 (`src/pages/`)

| 파일 | 설명 |
|------|------|
| `AdminLoginPage.tsx` | reCAPTCHA 인증 포함 관리자 로그인 |
| `AdminDashboardPage.tsx` | 관리자 정보 표시 대시보드 |
| `AdminMemberPage.tsx` | 회원 관리 (목록, 상태 토글, 삭제) |
| `AdminCategoryPage.tsx` | 카테고리 관리 (CRUD) |
| `AdminNotFound.tsx` | 404 에러 페이지 |
| `UiTestPage.tsx` | UI 컴포넌트 테스트 페이지 |

### 4.3 컴포넌트 (`src/components/`)

#### Layout
| 파일 | 설명 |
|------|------|
| `AdminLayout.tsx` | 메인 레이아웃 (사이드바 + 헤더 + 콘텐츠) |
| `AdminHeader.tsx` | 로그아웃 버튼 포함 헤더 |
| `AdminSidebar.tsx` | 네비게이션 메뉴 |

#### Common
| 파일 | 설명 |
|------|------|
| `LoadingOverlay.tsx` | 전체 화면 로딩 스피너 (Redux 연동) |
| `ToastContainer.tsx` | 토스트 알림 시스템 (3초 후 자동 해제) |

#### UI
| 파일 | 설명 |
|------|------|
| `button.tsx` | 다양한 variant 지원 버튼 컴포넌트 |
| `card.tsx` | 카드 래퍼 컴포넌트 |
| `tabs.tsx` | 탭 인터페이스 (Radix UI 기반) |
| `alert-dialog.tsx` | 알림 다이얼로그 (Radix UI 기반) |
| `Modal.tsx` | 기본 모달 컴포넌트 |
| `ConfirmModal.tsx` | 확인 다이얼로그 |

### 4.4 상태 관리 (`src/store/`)

| 파일 | 설명 |
|------|------|
| `store.ts` | Redux 스토어 설정 |
| `hooks.ts` | 타입화된 useDispatch/useSelector 훅 |
| `slices/loadingSlice.ts` | 전역 로딩 상태 관리 |
| `slices/toastSlice.ts` | 토스트 알림 상태 관리 |

**Toast 타입**: `success`, `error`, `info`, `warning`

### 4.5 라우터 (`src/router/`)

| 파일 | 설명 |
|------|------|
| `AppRouter.tsx` | 메인 라우터 설정 |
| `ProtectedAdminRoute.tsx` | 관리자 인증 라우트 가드 |

**라우트 구조**:
- `/ui-test` - UI 테스트 페이지 (공개)
- `/admin/login` - 로그인 페이지
- `/admin/*` - 보호된 관리자 라우트
  - `/admin/dashboard` - 대시보드
  - `/admin/members` - 회원 관리
  - `/admin/posts/category` - 카테고리 관리
- `*` - 404 페이지

### 4.6 프로바이더 (`src/providers/`)

| 파일 | 설명 |
|------|------|
| `ConfirmDialogProvider.tsx` | 전역 확인 다이얼로그 Context Provider |

### 4.7 유틸리티 (`src/utils/`, `src/lib/`)

| 파일 | 설명 |
|------|------|
| `utils/cookieUtil.ts` | 쿠키 유틸리티 함수 |
| `utils/withToast.ts` | API 호출 래퍼 (자동 토스트 처리) |
| `lib/utils.ts` | `cn()` 함수 (Tailwind 클래스 병합) |

### 4.8 타입 (`src/types/`)

| 파일 | 설명 |
|------|------|
| `Category.ts` | Category 인터페이스 (id, name) |

---

## 5. 아키텍처 패턴

### 5.1 전역 UI 패턴
- 로딩 오버레이와 토스트 알림을 Redux로 전역 관리
- 모든 Axios 요청이 자동으로 로딩 상태 트리거
- 에러 응답 시 자동 토스트 메시지 표시

### 5.2 보호된 라우트
- 관리자 라우트는 API 호출을 통한 역할 검증 필요
- 미인증 접근 시 로그인 페이지로 자동 리다이렉트

### 5.3 Context 기반 확인 다이얼로그
- React Context를 통한 전역 ConfirmDialog
- Promise 기반 API로 비동기 확인 처리
- useState 기반 모달보다 깔끔한 구현

### 5.4 API 인터셉터 전략
- 중앙화된 요청/응답 처리
- 자동 로딩 상태 관리
- 자동 에러 토스팅 (401 제외)
- 모든 요청에 credentials 포함

---

## 6. 환경 설정

### 개발 환경
- nip.io 도메인 사용
- 로컬 개발 서버 연동

### 프로덕션 환경
- emoforge.dev 도메인 (SSL)
- 마이크로서비스별 분리된 Base URL
  - Auth 서비스
  - Posts 서비스
  - Diary 서비스
  - Attach 서비스
  - LangGraph 서비스

---

## 7. 주요 의존성 목록

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | 19.1.1 | 프론트엔드 라이브러리 |
| react-dom | 19.1.1 | React 렌더링 |
| react-router | 7.9.1 | 클라이언트 사이드 라우팅 |
| @reduxjs/toolkit | 2.9.0 | 상태 관리 |
| react-redux | 9.2.0 | Redux React 바인딩 |
| axios | 1.12.2 | HTTP 클라이언트 |
| tailwindcss | 3.4.17 | 유틸리티 CSS |
| @radix-ui/* | Various | 헤드리스 UI 프리미티브 |
| class-variance-authority | 0.7.1 | CVA 컴포넌트 스타일링 |
| clsx | 2.1.1 | 클래스명 유틸리티 |
| tailwind-merge | 3.3.1 | Tailwind 클래스 병합 |
| react-google-recaptcha | 3.1.0 | reCAPTCHA 통합 |
| js-cookie | 3.0.5 | 쿠키 관리 |
| jwt-decode | 4.0.0 | JWT 토큰 파싱 |
| lucide-react | 0.544.0 | 아이콘 라이브러리 |
| typescript | 5.8.3 | 타입 체킹 |
| vite | 7.1.2 | 빌드 도구 |
| eslint | 9.33.0 | 린팅 |

---

## 8. 스타일링 방식

- **CSS 프레임워크**: TailwindCSS (유틸리티 우선)
- **CSS 변수**: HSL 기반 테마 컬러
- **컴포넌트 스타일링**: CVA (Class Variance Authority)
- **빌드**: PostCSS + TailwindCSS + AutoPrefixer
- **임포트**: `index.css`에서 Tailwind 디렉티브 사용

---

## 9. 빌드 & 배포

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (포트 5176) |
| `npm run build` | TypeScript 체크 + Vite 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |

**배포 방식**:
- Docker + Nginx 스택
- Base Path: `/admin/` (멀티 앱 라우팅 지원)

---

## 10. 인증 & 보안

- reCAPTCHA v2 검증이 포함된 관리자 전용 로그인
- 별도의 ADMIN JWT 토큰 (일반 사용자 토큰과 분리)
- 쿠키 기반 토큰 저장 (도메인/secure/samesite 설정 가능)
- 401 응답 시 자동 로그아웃
- 보호된 라우트에서 ROLE_ADMIN API 검증
- 모든 요청에 credentials 포함 (withCredentials: true)

---

## 11. 주요 아키텍처 하이라이트

1. **단일 Redux 스토어** - 로딩과 토스트를 위한 간단한 상태
2. **API 우선 인터셉터** - 자동 에러 처리 및 로딩 상태
3. **보호된 라우트 가드** - 서버 사이드 역할 검증
4. **Context 기반 다이얼로그** - Promise 기반 확인 다이얼로그
5. **환경 유연성** - 개발/프로덕션 설정 쉬운 전환
6. **타입 안전성** - strict 모드의 전체 TypeScript
7. **컴포넌트 라이브러리** - Radix UI + TailwindCSS 스타일링
8. **컨테이너화 배포** - Docker/Nginx 프로덕션 스택

---

*이 리포트는 admin-frontend 프로젝트의 구조를 분석 목적으로 문서화한 것입니다.*
*생성일: 2026-01-18*
