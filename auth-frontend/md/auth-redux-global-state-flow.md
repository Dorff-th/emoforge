# Auth-FE Redux 전역 상태 흐름 분석

> 인증(auth), 전역 로딩(loading), 토스트(toast) 흐름을 하나의 서버 요청 관점에서 분석한 문서

---

## 1. Redux Store 구조

### 1.1 Store 설정

**파일 경로**: `src/store/store.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import loadingReducer from "./slices/loadingSlice";
import toastReducer from "./slices/toastSlice";
import termsReducer from "@/store/slices/termsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loading: loadingReducer,
    toast: toastReducer,
    terms: termsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 1.2 Store 구조 다이어그램

```
┌────────────────────────────────────────────────────────────┐
│                     Redux Store                            │
├────────────────────────────────────────────────────────────┤
│  auth: {                                                   │
│    user: AuthUser | null,                                  │
│    status: "idle" | "loading" | "authenticated" |          │
│            "unauthenticated" | "deleted" | "error"         │
│  }                                                         │
├────────────────────────────────────────────────────────────┤
│  loading: {                                                │
│    isLoading: boolean                                      │
│  }                                                         │
├────────────────────────────────────────────────────────────┤
│  toast: {                                                  │
│    messages: ToastMessage[]                                │
│  }                                                         │
├────────────────────────────────────────────────────────────┤
│  terms: {                                                  │
│    open: boolean,                                          │
│    kakaoId: string,                                        │
│    nickname: string                                        │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Slice별 역할

### 2.1 authSlice

**파일 경로**: `src/store/slices/authSlice.ts`

**역할**: 사용자 인증 상태 및 프로필 정보 관리

#### State 인터페이스

```typescript
interface AuthUser {
  id?: string;
  uuid?: string;
  username?: string;
  nickname?: string;
  email?: string;
  role?: string;
  status?: string;
  profileImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  deletedAt?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "deleted" | "error";
}
```

#### 주요 Async Thunk

| Thunk | 설명 |
|-------|------|
| `fetchProfile` | `/me` 엔드포인트에서 사용자 프로필 조회. 프로필 이미지가 없으면 추가 조회 |
| `logoutThunk` | `/logout` 엔드포인트 호출 후 인증 상태 초기화 |

#### 상태 전이

```
idle → loading → authenticated (로그인 성공)
                → unauthenticated (401/403)
                → deleted (삭제된 계정)
                → error (기타 오류)
```

---

### 2.2 loadingSlice

**파일 경로**: `src/store/slices/loadingSlice.ts`

**역할**: 전역 로딩 UI 상태 관리 (API 요청 중 로딩 스피너 표시)

```typescript
interface LoadingState {
  isLoading: boolean;
}

const loadingSlice = createSlice({
  name: "loading",
  initialState: { isLoading: false },
  reducers: {
    startLoading: (state) => { state.isLoading = true; },
    stopLoading: (state) => { state.isLoading = false; },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});
```

#### Actions

| Action | 호출 시점 |
|--------|----------|
| `startLoading()` | 모든 API 요청 시작 시 (Request Interceptor) |
| `stopLoading()` | 모든 API 응답/에러 시 (Response Interceptor) |

---

### 2.3 toastSlice

**파일 경로**: `src/store/slices/toastSlice.ts`

**역할**: 전역 토스트 알림 메시지 관리

```typescript
interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  text: string;
}

interface ToastState {
  messages: ToastMessage[];
}

const toastSlice = createSlice({
  name: "toast",
  initialState: { messages: [] },
  reducers: {
    addToast: (state, action) => {
      state.messages.push({
        id: Date.now().toString(),
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((msg) => msg.id !== action.payload);
    },
  },
});
```

#### Actions

| Action | 호출 시점 |
|--------|----------|
| `addToast()` | API 에러 발생 시 (Response Interceptor), 사용자 액션 결과 피드백 |
| `removeToast()` | 토스트 자동 제거 (3초 후) 또는 수동 닫기 |

---

## 3. 로그인 요청 시 상태 변화 흐름

### 3.1 카카오 OAuth 로그인 전체 흐름

```
┌─────────────────────────────────────────────────────────────────────┐
│                    카카오 로그인 플로우                              │
└─────────────────────────────────────────────────────────────────────┘

[1] 사용자가 "카카오 로그인" 버튼 클릭
     │
     ▼
[2] 카카오 OAuth 페이지로 리다이렉트
     │
     ▼
[3] 인가 코드와 함께 /kakao/callback으로 리다이렉트
     │
     ▼
[4] KakaoCallbackPage에서 인가 코드를 백엔드 /kakao 엔드포인트로 전송
     │
     ├──→ NEED_AGREEMENT (신규 회원) → 약관 동의 페이지
     │
     └──→ LOGIN_OK (기존 회원) → fetchProfile() 호출 → /profile 이동
```

### 3.2 단계별 상태 변화 (기존 회원 로그인 기준)

#### Step 1: 인가 코드 전송 (POST /kakao)

**파일**: `src/pages/auth/KakaoCallbackPage.tsx:33`

```typescript
const res = await axiosAuth.post(`/kakao`, { code });
```

| Slice | 상태 변화 |
|-------|----------|
| `loading` | `isLoading: false` → `true` (Request Interceptor) |
| `auth` | 변화 없음 |
| `toast` | 변화 없음 |

---

#### Step 2: 응답 수신

**파일**: `src/api/setupInterceptors.ts:24-27`

```typescript
instance.interceptors.response.use(
  (response) => {
    store.dispatch(stopLoading());
    return response;
  },
  // ...
);
```

| Slice | 상태 변화 |
|-------|----------|
| `loading` | `isLoading: true` → `false` (Response Interceptor) |
| `auth` | 변화 없음 |
| `toast` | 변화 없음 |

---

#### Step 3: 프로필 조회 시작 (GET /me)

**파일**: `src/pages/auth/KakaoCallbackPage.tsx:57`

```typescript
if (data.status === "LOGIN_OK") {
  await dispatch(fetchProfile());
  navigate("/profile");
}
```

| Slice | 상태 변화 |
|-------|----------|
| `loading` | `isLoading: false` → `true` (Request Interceptor) |
| `auth` | `status: "idle"` → `"loading"` (fetchProfile.pending) |
| `toast` | 변화 없음 |

---

#### Step 4: 프로필 조회 완료

**파일**: `src/store/slices/authSlice.ts:87-95`

```typescript
.addCase(fetchProfile.fulfilled, (state, action) => {
  state.user = action.payload;
  if (action.payload.deleted) {
    state.status = "deleted";
  } else {
    state.status = "authenticated";
  }
})
```

| Slice | 상태 변화 |
|-------|----------|
| `loading` | `isLoading: true` → `false` (Response Interceptor) |
| `auth` | `status: "loading"` → `"authenticated"`, `user: {...}` |
| `toast` | 변화 없음 |

---

### 3.3 에러 발생 시 상태 변화

#### 401 에러 (토큰 만료) 흐름

**파일**: `src/api/setupInterceptors.ts:35-71`

```typescript
if (status === 401) {
  // 1) refresh 요청 자체에서 401 → 바로 로그아웃
  if (originalRequest.url.includes("/refresh")) {
    store.dispatch(logoutThunk());
    return Promise.reject(error);
  }

  // 2) 이미 _retry 했으면 → 더 이상 refresh 시도 금지
  if (originalRequest._retry) {
    store.dispatch(logoutThunk());
    return Promise.reject(error);
  }

  // 3) 첫 번째 401이면 → refresh 한번 시도
  originalRequest._retry = true;
  try {
    await axios.post(`${API_AUTH_BASE_URL}/refresh`, null, {
      withCredentials: true,
    });
    return instance(originalRequest); // 원본 요청 재시도
  } catch (refreshErr) {
    store.dispatch(logoutThunk());
    return Promise.reject(refreshErr);
  }
}
```

```
401 발생
    │
    ├── refresh 요청 자체가 401 → 즉시 logoutThunk() 호출
    │
    ├── 이미 재시도한 요청 → logoutThunk() 호출
    │
    └── 첫 401 → refresh 시도
         │
         ├── 성공 → 원본 요청 재시도
         │
         └── 실패 → logoutThunk() 호출
```

#### 기타 에러 흐름

**파일**: `src/api/setupInterceptors.ts:73-81`

```typescript
const message = error?.response?.data?.message || "요청 처리 중 오류가 발생했습니다!";

store.dispatch(
  addToast({
    type: "error",
    text: message,
  })
);
```

| Slice | 상태 변화 |
|-------|----------|
| `loading` | `isLoading: true` → `false` |
| `auth` | 변화 없음 (401 제외) |
| `toast` | `messages` 배열에 에러 메시지 추가 |

---

## 4. 관련 파일 경로 및 핵심 코드

### 4.1 파일 목록

| 파일 경로 | 역할 |
|-----------|------|
| `src/store/store.ts` | Redux Store 설정 |
| `src/store/hooks.ts` | Typed useAppDispatch, useAppSelector |
| `src/store/slices/authSlice.ts` | 인증 상태 관리 |
| `src/store/slices/loadingSlice.ts` | 전역 로딩 상태 관리 |
| `src/store/slices/toastSlice.ts` | 토스트 알림 관리 |
| `src/api/axiosAuth.ts` | Axios 인스턴스 설정 |
| `src/api/setupInterceptors.ts` | Request/Response 인터셉터 |
| `src/pages/auth/KakaoCallbackPage.tsx` | OAuth 콜백 처리 |
| `src/router/AppRouter.tsx` | 앱 라우팅 및 초기 인증 확인 |
| `src/private/PrivateRoute.tsx` | 인증 필요 라우트 가드 |

### 4.2 앱 초기화 시 인증 확인

**파일**: `src/router/AppRouter.tsx:26-28`

```typescript
// 인증 확인 thunk는 App 진입 시 1회 실행
useEffect(() => {
  dispatch(fetchProfileThunk());
}, []);
```

### 4.3 PrivateRoute 인증 가드

**파일**: `src/private/PrivateRoute.tsx:8-38`

```typescript
export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { status } = useAppSelector((s) => s.auth);

  if (status === "idle" || status === "loading") {
    return <StateLoading />;
  }

  if (status === "unauthenticated") {
    const hasRefresh = document.cookie.includes("refresh_token=");
    if (!hasRefresh) {
      return <Navigate to="/login" replace />;
    }
    // refresh_token 있으므로 인터셉터가 재발급 시도
  }

  if (status === "deleted") {
    return <Navigate to="/withdraw/pending" replace />;
  }

  return children;
}
```

---

## 5. 상태 흐름 시퀀스 다이어그램

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Component│     │  Axios   │     │  Redux   │
│          │     │          │     │Interceptor│    │  Store   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  로그인 버튼 클릭  │                │                │
     │───────────────►│                │                │
     │                │                │                │
     │                │  POST /kakao   │                │
     │                │───────────────►│                │
     │                │                │ startLoading() │
     │                │                │───────────────►│
     │                │                │                │ loading.isLoading = true
     │                │                │                │
     │                │◄───────────────│                │
     │                │   응답 수신     │ stopLoading()  │
     │                │                │───────────────►│
     │                │                │                │ loading.isLoading = false
     │                │                │                │
     │                │  dispatch(fetchProfile())       │
     │                │────────────────────────────────►│
     │                │                │                │ auth.status = "loading"
     │                │                │                │
     │                │  GET /me       │                │
     │                │───────────────►│                │
     │                │                │ startLoading() │
     │                │                │───────────────►│
     │                │                │                │ loading.isLoading = true
     │                │                │                │
     │                │◄───────────────│                │
     │                │   프로필 응답   │ stopLoading()  │
     │                │                │───────────────►│
     │                │                │                │ loading.isLoading = false
     │                │                │                │ auth.status = "authenticated"
     │                │                │                │ auth.user = {...}
     │◄───────────────│                │                │
     │  /profile 이동  │                │                │
     │                │                │                │
```

---

## 6. 구조의 장단점

### 6.1 장점

| 항목 | 설명 |
|------|------|
| **명확한 관심사 분리** | auth, loading, toast 각각 독립적인 slice로 분리되어 유지보수 용이 |
| **전역 로딩 자동화** | Axios Interceptor에서 모든 API 요청에 자동으로 로딩 상태 관리 |
| **일관된 에러 처리** | Interceptor에서 에러 메시지를 일괄 처리하여 토스트로 표시 |
| **토큰 갱신 자동화** | 401 에러 시 자동으로 refresh 시도 후 원본 요청 재시도 |
| **타입 안전성** | TypeScript 기반의 RootState, AppDispatch 타입 제공 |
| **Redux Toolkit 활용** | createSlice, createAsyncThunk로 보일러플레이트 코드 최소화 |
| **삭제된 계정 처리** | auth.status = "deleted" 상태로 탈퇴 대기 페이지 자동 리다이렉트 |

### 6.2 단점

| 항목 | 설명 |
|------|------|
| **전역 로딩의 한계** | 모든 API 요청에 로딩 스피너가 표시되어 UX 저하 가능. 세분화된 로딩 상태 필요 시 추가 작업 필요 |
| **Interceptor 복잡성** | 토큰 갱신 로직이 Interceptor에 포함되어 테스트 및 디버깅 어려움 |
| **Redux 의존성** | 컴포넌트들이 Redux에 강하게 결합되어 있어 React Query 등으로 마이그레이션 시 비용 발생 |
| **동시 요청 시 로딩 상태** | 여러 API 동시 요청 시 첫 번째 응답에서 로딩이 해제되어 다른 요청의 로딩 상태 표시 불가 |
| **서버 상태와 클라이언트 상태 혼재** | auth slice가 서버 데이터(user)와 클라이언트 상태(status)를 함께 관리 |
| **캐싱 부재** | 프로필 데이터 캐싱이 없어 페이지 이동 시마다 새로 조회 필요 |

### 6.3 개선 권장사항

1. **로딩 상태 세분화**: 요청별 로딩 상태 관리 (예: `loadingSlice`에 `activeRequests` 카운터 도입)
2. **React Query 도입 고려**: 서버 상태 관리를 React Query로 분리하여 캐싱, 리페칭 등 자동화
3. **에러 바운더리 활용**: 컴포넌트 레벨 에러 처리와 전역 에러 처리 병행
4. **로딩 UI 개선**: 스켈레톤 UI 도입으로 사용자 경험 향상

---

## 7. 참고

- Redux Toolkit 공식 문서: https://redux-toolkit.js.org/
- Axios Interceptors: https://axios-http.com/docs/interceptors
