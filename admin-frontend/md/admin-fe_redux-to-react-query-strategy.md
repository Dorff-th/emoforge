# Admin-Frontend: Redux → React Query 전환 전략

## 개요

이 문서는 admin-frontend 프로젝트에서 Redux를 단계적으로 제거하고 React Query(TanStack Query)로 전환하기 위한 전략을 정리한 것입니다.

---

## 1. 현재 Redux 사용 범위 요약

### 1.1 Redux Slice 목록

| Slice | 파일 경로 | 용도 |
|-------|----------|------|
| `loadingSlice` | `src/store/slices/loadingSlice.ts` | 전역 로딩 오버레이 상태 관리 |
| `toastSlice` | `src/store/slices/toastSlice.ts` | 전역 토스트 알림 메시지 관리 |

> **참고**: `rootReducer.ts`는 존재하나 실제로 사용되지 않음 (store.ts에서 직접 reducer 구성)

### 1.2 loadingSlice 상세

```typescript
// src/store/slices/loadingSlice.ts
interface LoadingState {
  isLoading: boolean;
}

// Actions
- startLoading(): isLoading = true
- stopLoading(): isLoading = false
- setLoading(boolean): isLoading = payload
```

**사용처:**
| 파일 | 사용 방식 |
|------|----------|
| `src/api/setupInterceptors.ts` | 모든 API 요청 시작 시 `startLoading()`, 완료/에러 시 `stopLoading()` |
| `src/components/common/LoadingOverlay.tsx` | `useAppSelector`로 `isLoading` 구독하여 렌더링 |
| `src/pages/UiTestPage.tsx` | 테스트용 수동 dispatch |

### 1.3 toastSlice 상세

```typescript
// src/store/slices/toastSlice.ts
interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  text: string;
}

interface ToastState {
  messages: ToastMessage[];
}

// Actions
- addToast({ type, text }): 새 토스트 추가
- removeToast(id): 특정 토스트 제거
```

**사용처:**
| 파일 | 사용 방식 |
|------|----------|
| `src/api/setupInterceptors.ts` | API 에러 응답 시 자동으로 에러 토스트 dispatch |
| `src/utils/withToast.ts` | API 호출 래퍼 함수에서 성공/에러 시 토스트 dispatch |
| `src/components/common/ToastContainer.tsx` | `useAppSelector`로 messages 구독, 3초 후 자동 제거 |
| `src/pages/UiTestPage.tsx` | 테스트용 수동 dispatch |
| `src/pages/AdminLoginPage.tsx` | 로그인 성공/실패 시 토스트 (⚠️ dispatch 없이 직접 호출 - 버그) |

### 1.4 Redux 의존성 파일 전체 목록

```
src/
├── store/
│   ├── store.ts                    # Redux store 설정
│   ├── hooks.ts                    # useAppDispatch, useAppSelector
│   └── slices/
│       ├── loadingSlice.ts         # 로딩 상태
│       ├── toastSlice.ts           # 토스트 상태
│       └── rootReducer.ts          # (미사용)
├── api/
│   └── setupInterceptors.ts        # Axios 인터셉터 (Redux dispatch)
├── utils/
│   └── withToast.ts                # 토스트 래퍼 (store.dispatch)
├── components/common/
│   ├── LoadingOverlay.tsx          # 로딩 UI (useAppSelector)
│   └── ToastContainer.tsx          # 토스트 UI (useAppSelector, useAppDispatch)
└── pages/
    ├── UiTestPage.tsx              # 테스트 페이지 (useDispatch)
    └── AdminLoginPage.tsx          # 로그인 (addToast 직접 호출 - 버그)
```

---

## 2. React Query로 대체 가능/불가능한 영역 분리

### 2.1 대체 가능한 영역 ✅

| 현재 방식 | React Query 대체 방안 |
|----------|----------------------|
| **API 데이터 페칭** (useState + useEffect) | `useQuery` 훅 |
| **API 뮤테이션** (직접 axios 호출) | `useMutation` 훅 |
| **로딩 상태** (loadingSlice) | `useIsFetching()` 전역 훅 또는 개별 `isLoading` |
| **에러 토스트** (인터셉터 기반) | `useMutation`의 `onError` 콜백 |
| **성공 토스트** (withToast) | `useMutation`의 `onSuccess` 콜백 |
| **캐싱 & 리페치** (수동 구현) | React Query 자동 캐싱 |

**대체 대상 API 호출:**
- `AdminCategoryPage.tsx`: fetchCategories, createCategory, updateCategory, deleteCategory
- `AdminMemberPage.tsx`: 회원 목록, 상태 변경, 삭제 API
- `AdminDashboardPage.tsx`: 관리자 정보 조회
- `ProtectedAdminRoute.tsx`: 인증 확인 API

### 2.2 대체 불가능/별도 구현 필요 영역 ⚠️

| 기능 | 이유 | 권장 대안 |
|------|------|----------|
| **전역 토스트 UI 상태** | React Query는 UI 상태 관리 도구가 아님 | Context API + useReducer 또는 전용 라이브러리 (react-hot-toast, sonner) |
| **토스트 메시지 배열 관리** | 다중 토스트 큐잉/제거 로직 필요 | 동일 |
| **Axios 인터셉터 통합** | React Query 외부에서 발생하는 요청 | QueryClient의 global callbacks 또는 제거 |

---

## 3. 전환 단계 (Phase 1~4)

### Phase 1: 기반 설정 (공존 준비)

**목표**: React Query 설치 및 Redux와 공존하는 환경 구성

**작업 항목:**
1. React Query 설치
   ```bash
   npm install @tanstack/react-query @tanstack/react-query-devtools
   ```

2. QueryClient 설정 및 Provider 추가
   ```typescript
   // src/lib/queryClient.ts
   import { QueryClient } from '@tanstack/react-query';

   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5분
         retry: 1,
       },
       mutations: {
         onError: (error) => {
           // 전역 에러 처리 (토스트 연동)
         },
       },
     },
   });
   ```

3. `main.tsx`에 QueryClientProvider 추가 (기존 Redux Provider 유지)
   ```tsx
   <QueryClientProvider client={queryClient}>
     <Provider store={store}>
       <App />
     </Provider>
     <ReactQueryDevtools />
   </QueryClientProvider>
   ```

4. 토스트 시스템 대안 선택 및 설치
   - 옵션 A: `react-hot-toast` (경량, 간단)
   - 옵션 B: `sonner` (모던, 애니메이션)
   - 옵션 C: Context + useReducer (직접 구현)

**결과물:**
- Redux와 React Query가 동시에 동작하는 환경
- 기존 기능 100% 유지

---

### Phase 2: 토스트 시스템 마이그레이션

**목표**: toastSlice를 독립적인 토스트 시스템으로 대체

**작업 항목:**

1. 토스트 Context 생성 (또는 라이브러리 도입)
   ```typescript
   // src/providers/ToastProvider.tsx
   interface Toast {
     id: string;
     type: 'success' | 'error' | 'info' | 'warning';
     text: string;
   }

   const ToastContext = createContext<{
     addToast: (toast: Omit<Toast, 'id'>) => void;
     removeToast: (id: string) => void;
   } | null>(null);

   export function useToast() {
     const context = useContext(ToastContext);
     if (!context) throw new Error('ToastProvider required');
     return context;
   }
   ```

2. ToastContainer 컴포넌트 마이그레이션
   - `useAppSelector` → `useToast()` 훅으로 변경

3. setupInterceptors.ts 수정
   - 문제: 인터셉터는 React 컴포넌트 외부에서 실행됨
   - 해결 방안:
     ```typescript
     // 토스트 함수를 외부에서 주입받는 방식
     let toastHandler: ((toast: Toast) => void) | null = null;

     export function setToastHandler(handler: typeof toastHandler) {
       toastHandler = handler;
     }

     // 인터셉터 내부에서
     if (toastHandler) {
       toastHandler({ type: 'error', text: message });
     }
     ```

4. withToast.ts 수정
   - store.dispatch 제거
   - 토스트 핸들러 함수 주입 방식으로 변경

5. UiTestPage.tsx, AdminLoginPage.tsx 수정
   - `useToast()` 훅 사용으로 변경

**마이그레이션 매핑:**
| 이전 | 이후 |
|------|------|
| `store.dispatch(addToast(...))` | `toast.addToast(...)` |
| `useAppSelector(state => state.toast)` | `useToast()` |
| `dispatch(removeToast(id))` | `toast.removeToast(id)` |

**결과물:**
- toastSlice 제거 가능
- 토스트 기능 독립적 동작

---

### Phase 3: API 레이어 마이그레이션

**목표**: 모든 API 호출을 React Query로 전환

**작업 항목:**

1. Query/Mutation 훅 생성
   ```typescript
   // src/hooks/queries/useCategories.ts
   export function useCategories() {
     return useQuery({
       queryKey: ['categories'],
       queryFn: fetchCategories,
     });
   }

   export function useCreateCategory() {
     const queryClient = useQueryClient();
     const { addToast } = useToast();

     return useMutation({
       mutationFn: (name: string) => createCategory(name),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['categories'] });
         addToast({ type: 'success', text: '카테고리 생성 완료' });
       },
       onError: (error) => {
         addToast({ type: 'error', text: error.message });
       },
     });
   }
   ```

2. 페이지별 마이그레이션 순서:

   **Step 3-1**: `AdminCategoryPage.tsx`
   - `useState` + `useEffect` + `fetchCategories()` → `useCategories()`
   - 직접 API 호출 → `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()`
   - `withToast` 제거 → mutation의 `onSuccess`/`onError` 활용

   **Step 3-2**: `AdminMemberPage.tsx`
   - 동일 패턴 적용

   **Step 3-3**: `AdminDashboardPage.tsx`
   - 관리자 정보 조회 → `useAdminInfo()` 쿼리

   **Step 3-4**: `ProtectedAdminRoute.tsx`
   - 인증 확인 → `useAdminAuth()` 쿼리

3. Axios 인터셉터에서 로딩 dispatch 제거
   - `startLoading()`, `stopLoading()` 호출 제거
   - 에러 토스트는 Phase 2에서 이미 처리됨

**결과물:**
- 모든 API 호출이 React Query로 전환
- withToast.ts 제거 가능
- setupInterceptors.ts에서 Redux 의존성 제거

---

### Phase 4: Redux 완전 제거

**목표**: loadingSlice 제거 및 Redux 패키지 언인스톨

**작업 항목:**

1. 전역 로딩 오버레이 마이그레이션
   ```typescript
   // src/components/common/LoadingOverlay.tsx
   import { useIsFetching, useIsMutating } from '@tanstack/react-query';

   export default function LoadingOverlay() {
     const isFetching = useIsFetching();
     const isMutating = useIsMutating();

     if (isFetching === 0 && isMutating === 0) return null;

     return (
       <div className="fixed inset-0 z-50 ...">
         {/* 로딩 UI */}
       </div>
     );
   }
   ```

2. UiTestPage.tsx에서 수동 로딩 테스트 제거 또는 대체
   - 테스트용이므로 제거하거나 mutation 테스트로 대체

3. Redux 관련 파일 삭제
   ```
   삭제 대상:
   - src/store/store.ts
   - src/store/hooks.ts
   - src/store/slices/loadingSlice.ts
   - src/store/slices/toastSlice.ts
   - src/store/slices/rootReducer.ts
   - src/store/ (디렉토리 전체)
   ```

4. main.tsx에서 Redux Provider 제거
   ```tsx
   // 제거
   import { Provider } from 'react-redux';
   import { store } from './store/store';

   // 최종 구조
   <QueryClientProvider client={queryClient}>
     <ToastProvider>
       <ConfirmDialogProvider>
         <App />
       </ConfirmDialogProvider>
     </ToastProvider>
     <ReactQueryDevtools />
   </QueryClientProvider>
   ```

5. vite.config.ts에서 `@store` alias 제거

6. Redux 패키지 언인스톨
   ```bash
   npm uninstall @reduxjs/toolkit react-redux
   ```

**결과물:**
- Redux 완전 제거
- React Query + Context API 기반 상태 관리

---

## 4. Axios 인터셉터 패턴을 React Query에서 유지하는 방법

### 4.1 loadingSlice 대체 방안

**현재 방식 (setupInterceptors.ts):**
```typescript
instance.interceptors.request.use((config) => {
  store.dispatch(startLoading());
  return config;
});

instance.interceptors.response.use(
  (response) => {
    store.dispatch(stopLoading());
    return response;
  },
  (error) => {
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);
```

**React Query 대체 방안:**

```typescript
// LoadingOverlay.tsx
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export default function LoadingOverlay() {
  const fetchingCount = useIsFetching();
  const mutatingCount = useIsMutating();

  // React Query가 관리하는 모든 요청의 로딩 상태를 자동 추적
  const isLoading = fetchingCount > 0 || mutatingCount > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-white" />
    </div>
  );
}
```

**장점:**
- Axios 인터셉터 로직 제거 가능
- React Query가 자동으로 요청 상태 추적
- 더 정확한 로딩 상태 (요청 개수 기반)

**특정 쿼리 제외하기:**
```typescript
// 백그라운드 폴링 등은 로딩 표시 안 함
useQuery({
  queryKey: ['status'],
  queryFn: fetchStatus,
  meta: { showGlobalLoading: false },
});

// LoadingOverlay에서 필터링
const fetchingCount = useIsFetching({
  predicate: (query) => query.meta?.showGlobalLoading !== false,
});
```

### 4.2 toastSlice 연동 방안

**방안 A: QueryClient 전역 콜백 (권장)**

```typescript
// src/lib/queryClient.ts
import { toast } from './toastUtils'; // 또는 react-hot-toast

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error: Error) => {
        // 모든 mutation 에러에 대해 자동 토스트
        const message = error.message || '요청 처리 중 오류가 발생했습니다.';
        toast.error(message);
      },
    },
  },
});
```

**방안 B: MutationCache 활용**

```typescript
// src/lib/queryClient.ts
import { QueryClient, MutationCache } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // 특정 mutation만 토스트 표시
      if (mutation.meta?.showErrorToast !== false) {
        toast.error(error.message);
      }
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      // 성공 토스트
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage as string);
      }
    },
  }),
});

// 사용 예
useMutation({
  mutationFn: deleteCategory,
  meta: {
    showErrorToast: true,
    successMessage: '카테고리가 삭제되었습니다.',
  },
});
```

**방안 C: 개별 Mutation에서 처리**

```typescript
export function useDeleteCategory() {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      addToast({ type: 'success', text: '카테고리 삭제 완료' });
    },
    onError: (error) => {
      addToast({ type: 'error', text: error.message });
    },
  });
}
```

### 4.3 기존 Axios 인터셉터 처리

**Phase 완료 후 setupInterceptors.ts 최종 형태:**

```typescript
import type { AxiosInstance } from 'axios';

export default function setupInterceptors(instance: AxiosInstance) {
  // 로딩 관련 코드 제거 (React Query가 처리)

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // 401 처리만 유지 (또는 이것도 React Query로 이동)
      if (error?.response?.status === 401) {
        // 로그아웃 처리
        window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }
  );
}
```

**또는 인터셉터 파일 자체를 삭제하고 QueryClient에서 처리:**

```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if ((error as any)?.response?.status === 401) {
          window.location.href = '/admin/login';
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
```

---

## 5. 마이그레이션 체크리스트

### Phase 1 체크리스트
- [ ] `@tanstack/react-query` 설치
- [ ] `@tanstack/react-query-devtools` 설치
- [ ] `src/lib/queryClient.ts` 생성
- [ ] `main.tsx`에 `QueryClientProvider` 추가
- [ ] DevTools 동작 확인
- [ ] 기존 기능 회귀 테스트

### Phase 2 체크리스트
- [ ] 토스트 시스템 선택 (Context/react-hot-toast/sonner)
- [ ] `ToastProvider` 생성 또는 라이브러리 설정
- [ ] `ToastContainer.tsx` 마이그레이션
- [ ] `setupInterceptors.ts` 토스트 로직 수정
- [ ] `withToast.ts` 수정 또는 제거
- [ ] `AdminLoginPage.tsx` 토스트 버그 수정 및 마이그레이션
- [ ] `UiTestPage.tsx` 토스트 테스트 수정
- [ ] `toastSlice.ts` 제거
- [ ] 토스트 기능 회귀 테스트

### Phase 3 체크리스트
- [ ] `src/hooks/queries/` 디렉토리 생성
- [ ] **AdminCategoryPage**
  - [ ] `useCategories()` 쿼리 훅 생성
  - [ ] `useCreateCategory()` mutation 훅 생성
  - [ ] `useUpdateCategory()` mutation 훅 생성
  - [ ] `useDeleteCategory()` mutation 훅 생성
  - [ ] 페이지 컴포넌트 리팩토링
  - [ ] 기능 테스트
- [ ] **AdminMemberPage**
  - [ ] 관련 쿼리/mutation 훅 생성
  - [ ] 페이지 컴포넌트 리팩토링
  - [ ] 기능 테스트
- [ ] **AdminDashboardPage**
  - [ ] `useAdminInfo()` 쿼리 훅 생성
  - [ ] 페이지 컴포넌트 리팩토링
- [ ] **ProtectedAdminRoute**
  - [ ] `useAdminAuth()` 쿼리 훅 생성
  - [ ] 라우트 가드 리팩토링
- [ ] `setupInterceptors.ts`에서 로딩 dispatch 제거
- [ ] `withToast.ts` 완전 제거
- [ ] 전체 API 호출 회귀 테스트

### Phase 4 체크리스트
- [ ] `LoadingOverlay.tsx`를 `useIsFetching` 기반으로 수정
- [ ] `UiTestPage.tsx` 로딩 테스트 수정/제거
- [ ] `src/store/` 디렉토리 전체 삭제
- [ ] `main.tsx`에서 Redux Provider 제거
- [ ] `vite.config.ts`에서 `@store` alias 제거
- [ ] `tsconfig.json`에서 `@store` path 제거
- [ ] `@reduxjs/toolkit` 언인스톨
- [ ] `react-redux` 언인스톨
- [ ] 전체 기능 회귀 테스트
- [ ] 빌드 성공 확인
- [ ] 배포 테스트

---

## 6. 위험요소 및 회귀 버그 포인트

### 6.1 높은 위험도 🔴

| 영역 | 위험 요소 | 대응 방안 |
|------|----------|----------|
| **Axios 인터셉터** | React Query 외부에서 토스트/로딩 dispatch 제거 시 동작 안 함 | Phase 2에서 토스트 핸들러 주입 패턴 적용 |
| **401 인증 에러** | 인터셉터 제거 시 자동 로그아웃 안 됨 | QueryClient의 retry 또는 onError에서 처리 |
| **전역 로딩 오버레이** | React Query 관리 외 요청은 로딩 표시 안 됨 | 모든 API 호출을 React Query로 전환 필수 |
| **동시 요청 로딩** | useIsFetching 카운트 기반이라 개별 쿼리 상태와 다를 수 있음 | 필요시 개별 isLoading 사용 |

### 6.2 중간 위험도 🟡

| 영역 | 위험 요소 | 대응 방안 |
|------|----------|----------|
| **캐시 무효화** | 데이터 변경 후 목록이 갱신 안 될 수 있음 | `invalidateQueries` 정확히 호출 |
| **토스트 중복** | 인터셉터 + mutation 양쪽에서 토스트 발생 | Phase 순서 준수, 중복 제거 확인 |
| **AdminLoginPage 버그** | 현재 `addToast` 직접 호출로 동작 안 함 | Phase 2에서 수정 |
| **테스트 페이지** | UiTestPage가 Redux 직접 사용 | Phase 4에서 수정 또는 제거 |

### 6.3 낮은 위험도 🟢

| 영역 | 위험 요소 | 대응 방안 |
|------|----------|----------|
| **빌드 에러** | import 경로 오류 | 단계별 빌드 확인 |
| **타입 에러** | Redux 타입 제거 후 누락 | TypeScript strict 모드로 검증 |
| **DevTools** | Redux DevTools 제거됨 | React Query DevTools로 대체 |

### 6.4 롤백 계획

각 Phase 완료 후 커밋을 생성하여 문제 발생 시 롤백 가능하도록 함:

```bash
git commit -m "Phase 1: React Query 기반 설정 추가"
git commit -m "Phase 2: 토스트 시스템 마이그레이션 완료"
git commit -m "Phase 3: API 레이어 React Query 전환 완료"
git commit -m "Phase 4: Redux 완전 제거"
```

### 6.5 테스트 시나리오

**필수 테스트 항목:**
1. 로그인 → 대시보드 이동 → 로그아웃
2. 카테고리 CRUD (생성, 조회, 수정, 삭제)
3. 회원 목록 조회 및 상태 변경
4. API 에러 시 토스트 표시 확인
5. 401 에러 시 로그인 페이지 리다이렉트
6. 동시 다중 요청 시 로딩 오버레이 동작
7. 네트워크 오류 시 에러 처리

---

## 7. 예상 최종 디렉토리 구조

```
src/
├── api/
│   ├── axiosAuthAdmin.ts
│   ├── axiosPostsAdmin.ts
│   ├── adminCategoryApi.ts      # 순수 API 함수만 유지
│   └── setupInterceptors.ts     # 401 처리만 유지 또는 제거
├── hooks/
│   └── queries/
│       ├── useCategories.ts     # 새로 추가
│       ├── useMembers.ts        # 새로 추가
│       └── useAdminAuth.ts      # 새로 추가
├── lib/
│   ├── utils.ts
│   └── queryClient.ts           # 새로 추가
├── providers/
│   ├── ConfirmDialogProvider.tsx
│   └── ToastProvider.tsx        # 새로 추가
├── components/
│   ├── common/
│   │   ├── LoadingOverlay.tsx   # useIsFetching 기반으로 수정
│   │   └── ToastContainer.tsx   # ToastProvider 기반으로 수정
│   └── ...
└── pages/
    └── ...

# 삭제됨
# src/store/ (전체)
# src/utils/withToast.ts
```

---

## 8. 참고 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [React Query와 전역 상태 관리](https://tkdodo.eu/blog/practical-react-query)
- [Axios Interceptors with React Query](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-react-query-3#axios-interceptors)

---

*문서 작성일: 2026-01-18*
*기준 프로젝트: admin-frontend (./md/report.md 참조)*
