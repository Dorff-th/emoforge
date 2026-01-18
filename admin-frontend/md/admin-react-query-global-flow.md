# Admin-FE: React Query 기반 전역 상태 관리 구조 분석

## 목차
1. [Redux 제거 배경](#1-redux-제거-배경)
2. [인증(Auth) - useQuery 기반 처리 흐름](#2-인증auth---usequery-기반-처리-흐름)
3. [전역 로딩 - useIsFetching 기반 처리](#3-전역-로딩---useisfetching-기반-처리)
4. [토스트 - Context 기반 분리 구조](#4-토스트---context-기반-분리-구조)
5. [서버 요청 1건 기준 전체 흐름](#5-서버-요청-1건-기준-전체-흐름)
6. [관련 파일 경로 요약](#6-관련-파일-경로-요약)

---

## 1. Redux 제거 배경

### 1.1 기존 Redux 사용의 문제점

| 문제점 | 설명 |
|--------|------|
| **보일러플레이트 과다** | Action, Reducer, Selector 등 반복 코드가 많음 |
| **서버 상태와 클라이언트 상태 혼재** | 캐싱, 동기화, 리프레시 로직을 직접 구현해야 함 |
| **로딩/에러 상태 관리 복잡** | 각 요청마다 isLoading, error 상태를 수동 관리 |
| **중복 요청 처리 미흡** | 동일 데이터에 대한 중복 API 호출 방지가 어려움 |

### 1.2 React Query 도입 이점

| 이점 | 설명 |
|------|------|
| **선언적 데이터 페칭** | `useQuery` 훅 하나로 로딩, 에러, 데이터 상태 자동 관리 |
| **자동 캐싱 및 동기화** | `staleTime`, `gcTime` 설정으로 캐시 전략 제어 |
| **전역 로딩 상태** | `useIsFetching` 훅으로 모든 쿼리 로딩 상태 통합 감지 |
| **Optimistic Updates** | `useMutation`의 `onSuccess`에서 캐시 즉시 갱신 가능 |
| **DevTools 지원** | React Query Devtools로 쿼리 상태 실시간 디버깅 |

---

## 2. 인증(Auth) - useQuery 기반 처리 흐름

### 2.1 인증 아키텍처 개요

```
[ProtectedAdminRoute]
        │
        ▼
  [useAdminAuth()]
        │
        ▼
   [useAdminMe()] ──────► GET /admin/me
        │                     │
        ▼                     ▼
  캐시 확인 ◄────────── 응답: { username, role, message }
        │
        ▼
  isAuthorized = role === 'ROLE_ADMIN'
```

### 2.2 핵심 코드

**파일: `src/hooks/queries/useAdminAuth.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import axiosAuthAdmin from '@/api/axiosAuthAdmin';

export interface AdminInfo {
  username: string;
  role: string;
  message: string;
}

export const adminAuthKeys = {
  me: ['admin', 'me'] as const,
};

async function fetchAdminMe(): Promise<AdminInfo> {
  const res = await axiosAuthAdmin.get('/admin/me');
  return res.data;
}

export function useAdminMe() {
  return useQuery({
    queryKey: adminAuthKeys.me,
    queryFn: fetchAdminMe,
    retry: false,           // 인증 실패 시 재시도하지 않음
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });
}

export function useAdminAuth() {
  const query = useAdminMe();

  const isAuthorized = query.isSuccess && query.data?.role === 'ROLE_ADMIN';
  const isLoading = query.isLoading;
  const isError = query.isError;

  return {
    isAuthorized,
    isLoading,
    isError,
    adminInfo: query.data,
  };
}
```

### 2.3 라우트 보호 적용

**파일: `src/router/ProtectedAdminRoute.tsx`**

```typescript
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/queries/useAdminAuth';

export default function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthorized, isLoading, isError } = useAdminAuth();

  if (isLoading) {
    return <div>관리자 인증 중...</div>;
  }

  if (isError || !isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
```

### 2.4 인증 흐름 요약

1. 보호된 라우트 접근 시 `useAdminAuth()` 호출
2. 내부적으로 `useAdminMe()` 쿼리 실행
3. 캐시가 fresh하면 API 호출 없이 캐시 데이터 반환
4. 캐시가 stale하거나 없으면 `/admin/me` API 호출
5. `role === 'ROLE_ADMIN'` 검증 후 라우트 접근 허용/거부

---

## 3. 전역 로딩 - useIsFetching 기반 처리

### 3.1 전역 로딩 아키텍처

```
[QueryClientProvider]
        │
        ├── [App]
        │     ├── [ToastProvider]
        │     ├── [AppRouter]
        │     └── [LoadingOverlay] ◄── useIsFetching() + useIsMutating()
        │
        ▼
  모든 Query/Mutation 상태 자동 감지
```

### 3.2 핵심 코드

**파일: `src/components/common/LoadingOverlay.tsx`**

```typescript
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export default function LoadingOverlay() {
  const isFetching = useIsFetching();  // 진행 중인 Query 개수
  const isMutating = useIsMutating();  // 진행 중인 Mutation 개수

  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-white" />
        <p className="mt-3 text-white">Loading...</p>
      </div>
    </div>
  );
}
```

### 3.3 동작 원리

| 훅 | 설명 |
|----|------|
| `useIsFetching()` | 현재 진행 중인 모든 `useQuery` 요청 개수 반환 |
| `useIsMutating()` | 현재 진행 중인 모든 `useMutation` 요청 개수 반환 |

- 두 값의 합이 0보다 크면 로딩 오버레이 표시
- 모든 요청이 완료되면 자동으로 숨김
- **개별 컴포넌트에서 로딩 상태를 관리할 필요 없음**

---

## 4. 토스트 - Context 기반 분리 구조

### 4.1 토스트 아키텍처

```
[ToastProvider]
      │
      ├── Context: { toasts, addToast, removeToast }
      │
      ├── 내부 사용: useToast() 훅
      │
      └── 외부 사용: showToast() 함수 (Axios 인터셉터 등)
              │
              ▼
      [setupInterceptors] ──► showToast({ type: 'error', text: message })
```

### 4.2 핵심 코드

**파일: `src/providers/ToastProvider.tsx`**

```typescript
import { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  text: string;
}

// Context 정의
const ToastContext = createContext<ToastContextType | null>(null);

// React 외부에서 토스트를 호출하기 위한 핸들러
let externalToastHandler: ((toast: Omit<Toast, "id">) => void) | null = null;

export function setToastHandler(handler: typeof externalToastHandler) {
  externalToastHandler = handler;
}

// Axios 인터셉터 등 React 외부에서 호출 가능
export function showToast(toast: Omit<Toast, "id">) {
  if (externalToastHandler) {
    externalToastHandler(toast);
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Provider 마운트 시 외부 핸들러 등록
  useEffect(() => {
    setToastHandler(addToast);
    return () => setToastHandler(null);
  }, [addToast]);

  // 3초 후 자동 제거
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

// 컴포넌트 내부에서 사용하는 훅
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
```

### 4.3 Axios 인터셉터에서 토스트 호출

**파일: `src/api/setupInterceptors.ts`**

```typescript
import type { AxiosInstance } from "axios";
import { showToast } from "@/providers/ToastProvider";

export default function setupInterceptors(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      // 401 Unauthorized는 토스트 띄우지 않고 그대로 reject
      if (status === 401) {
        return Promise.reject(error);
      }

      const message =
        error?.response?.data?.message || "요청 처리 중 오류가 발생했습니다!";

      showToast({
        type: "error",
        text: message,
      });

      return Promise.reject(error);
    }
  );
}
```

### 4.4 토스트 사용 패턴

| 사용 위치 | 방법 | 예시 |
|-----------|------|------|
| React 컴포넌트 | `useToast()` 훅 | `addToast({ type: 'success', text: '저장 완료' })` |
| Axios 인터셉터 | `showToast()` 함수 | `showToast({ type: 'error', text: message })` |
| Mutation onSuccess | `useToast()` 훅 | 아래 예시 참조 |

**Mutation에서 토스트 사용 예시:**

```typescript
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      addToast({ type: 'success', text: '카테고리가 생성되었습니다.' });
    },
  });
}
```

---

## 5. 서버 요청 1건 기준 전체 흐름

### 5.1 카테고리 생성 요청 흐름 예시

```
[사용자] 카테고리 생성 버튼 클릭
    │
    ▼
[useCreateCategory] mutation 실행
    │
    ├─────────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
[useIsMutating] = 1                    [LoadingOverlay] 표시
    │
    ▼
[axiosPostsAdmin.post('/categories')]
    │
    ├── 성공 ────────────────────────────────┐
    │                                         │
    │   ▼                                     │
    │   [onSuccess 콜백]                       │
    │       ├── invalidateQueries()           │
    │       └── addToast('success')           │
    │                   │                     │
    │                   ▼                     │
    │           [ToastContainer] 표시          │
    │                                         │
    ├── 실패 (401 제외) ──────────────────────┤
    │                                         │
    │   ▼                                     │
    │   [setupInterceptors]                   │
    │       └── showToast('error')            │
    │                   │                     │
    │                   ▼                     │
    │           [ToastContainer] 표시          │
    │                                         │
    ▼                                         ▼
[useIsMutating] = 0                    [LoadingOverlay] 숨김
```

### 5.2 단계별 상세 흐름

| 단계 | 컴포넌트/함수 | 동작 |
|------|---------------|------|
| 1 | `AdminCategoryPage` | 생성 버튼 클릭 |
| 2 | `useCreateCategory` | `mutation.mutate(name)` 호출 |
| 3 | `useIsMutating` | 값 증가 (0 → 1) |
| 4 | `LoadingOverlay` | 오버레이 표시 |
| 5 | `axiosPostsAdmin` | POST `/categories` 요청 |
| 6-A (성공) | `onSuccess` | `invalidateQueries` + `addToast` |
| 6-B (실패) | `setupInterceptors` | `showToast('error')` |
| 7 | `useIsMutating` | 값 감소 (1 → 0) |
| 8 | `LoadingOverlay` | 오버레이 숨김 |
| 9 | `ToastContainer` | 3초간 토스트 표시 후 자동 제거 |

---

## 6. 관련 파일 경로 요약

### 6.1 핵심 설정 파일

| 파일 경로 | 역할 |
|-----------|------|
| `src/main.tsx` | QueryClientProvider 설정 |
| `src/lib/queryClient.ts` | QueryClient 인스턴스 및 기본 옵션 |
| `src/App.tsx` | ToastProvider, LoadingOverlay 조합 |

### 6.2 인증 관련 파일

| 파일 경로 | 역할 |
|-----------|------|
| `src/hooks/queries/useAdminAuth.ts` | 관리자 인증 쿼리 훅 |
| `src/router/ProtectedAdminRoute.tsx` | 인증 기반 라우트 보호 |
| `src/api/axiosAuthAdmin.ts` | 인증 서버용 Axios 인스턴스 |

### 6.3 전역 상태 관련 파일

| 파일 경로 | 역할 |
|-----------|------|
| `src/components/common/LoadingOverlay.tsx` | 전역 로딩 UI |
| `src/providers/ToastProvider.tsx` | 토스트 Context 및 UI |
| `src/api/setupInterceptors.ts` | Axios 에러 인터셉터 |

### 6.4 도메인별 쿼리 훅

| 파일 경로 | 역할 |
|-----------|------|
| `src/hooks/queries/useCategories.ts` | 카테고리 CRUD 쿼리/뮤테이션 |
| `src/hooks/queries/useMembers.ts` | 회원 관리 쿼리/뮤테이션 |

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                         main.tsx                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              QueryClientProvider                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                    App.tsx                       │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │              ToastProvider                 │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │            AppRouter                 │  │  │  │  │
│  │  │  │  │  ┌───────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │    ProtectedAdminRoute        │  │  │  │  │  │
│  │  │  │  │  │         │                     │  │  │  │  │  │
│  │  │  │  │  │         ▼                     │  │  │  │  │  │
│  │  │  │  │  │    useAdminAuth()             │  │  │  │  │  │
│  │  │  │  │  │         │                     │  │  │  │  │  │
│  │  │  │  │  │         ▼                     │  │  │  │  │  │
│  │  │  │  │  │    AdminLayout                │  │  │  │  │  │
│  │  │  │  │  │         │                     │  │  │  │  │  │
│  │  │  │  │  │    ┌────┴────┐                │  │  │  │  │  │
│  │  │  │  │  │    ▼         ▼                │  │  │  │  │  │
│  │  │  │  │  │  Pages    useQuery()          │  │  │  │  │  │
│  │  │  │  │  │           useMutation()       │  │  │  │  │  │
│  │  │  │  │  └───────────────────────────────┘  │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  │                                           │  │  │  │
│  │  │  │  ToastContainer ◄─── useToast()           │  │  │  │
│  │  │  │                  ◄─── showToast()         │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  │                                                  │  │  │
│  │  │  LoadingOverlay ◄─── useIsFetching()            │  │  │
│  │  │                  ◄─── useIsMutating()           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ReactQueryDevtools                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## QueryClient 기본 설정

**파일: `src/lib/queryClient.ts`**

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 - 데이터가 fresh로 간주되는 시간
      gcTime: 10 * 60 * 1000,   // 10분 - 캐시 유지 시간 (구 cacheTime)
      retry: 1,                  // 실패 시 1회 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 리페치 비활성화
    },
    mutations: {
      retry: 0, // Mutation은 재시도하지 않음
    },
  },
});
```

---

## 결론

Admin-FE 프로젝트는 Redux를 제거하고 React Query 중심으로 재구성되었습니다.

| 영역 | 이전 (Redux) | 이후 (React Query) |
|------|--------------|-------------------|
| 서버 상태 관리 | dispatch → reducer | useQuery / useMutation |
| 전역 로딩 | loading state 수동 관리 | useIsFetching / useIsMutating |
| 캐싱 | 직접 구현 | staleTime / gcTime 자동 |
| 토스트 | Redux action | Context + showToast 함수 |
| 인증 상태 | Redux store | useAdminAuth 쿼리 훅 |

이 구조를 통해 코드 복잡도가 감소하고, 서버 상태 동기화가 자동화되었습니다.
