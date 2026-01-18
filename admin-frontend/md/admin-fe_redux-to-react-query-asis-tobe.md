# Admin-Frontend: Redux → React Query 마이그레이션 AS-IS / TO-BE

## 1. 파일 변경 요약

### 1.1 신규 생성 파일

| 파일 경로 | 설명 |
|----------|------|
| `src/lib/queryClient.ts` | React Query 클라이언트 설정 |
| `src/providers/ToastProvider.tsx` | 토스트 Context Provider |
| `src/hooks/queries/useCategories.ts` | 카테고리 Query/Mutation 훅 |
| `src/hooks/queries/useMembers.ts` | 회원 Query/Mutation 훅 |
| `src/hooks/queries/useAdminAuth.ts` | 관리자 인증 Query 훅 |

### 1.2 삭제된 파일

| 파일 경로 | 설명 |
|----------|------|
| `src/store/store.ts` | Redux 스토어 설정 |
| `src/store/hooks.ts` | Redux 타입 훅 |
| `src/store/slices/loadingSlice.ts` | 로딩 상태 슬라이스 |
| `src/store/slices/toastSlice.ts` | 토스트 상태 슬라이스 |
| `src/store/slices/rootReducer.ts` | 루트 리듀서 |
| `src/components/common/ToastContainer.tsx` | 기존 토스트 컨테이너 |
| `src/utils/withToast.ts` | 토스트 래퍼 유틸 |

### 1.3 수정된 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `package.json` | React Query 추가, Redux 제거 |
| `src/main.tsx` | QueryClientProvider 추가, Redux Provider 제거 |
| `src/App.tsx` | ToastProvider 추가 |
| `src/api/setupInterceptors.ts` | 로딩 dispatch 제거, 토스트 함수 변경 |
| `src/components/common/LoadingOverlay.tsx` | useIsFetching 기반으로 변경 |
| `src/pages/AdminCategoryPage.tsx` | React Query 훅 사용 |
| `src/pages/AdminMemberPage.tsx` | React Query 훅 사용 |
| `src/pages/AdminDashboardPage.tsx` | React Query 훅 사용 |
| `src/pages/AdminLoginPage.tsx` | useToast 훅 사용 |
| `src/pages/UiTestPage.tsx` | useMutation, useToast 사용 |
| `src/router/ProtectedAdminRoute.tsx` | useAdminAuth 훅 사용 |
| `vite.config.ts` | @store alias 제거 |
| `tsconfig.app.json` | @store path 제거 |

---

## 2. 상세 AS-IS / TO-BE 비교

### 2.1 package.json

| 항목 | AS-IS | TO-BE |
|------|-------|-------|
| Redux 패키지 | `@reduxjs/toolkit: ^2.9.0`<br>`react-redux: ^9.2.0` | (제거됨) |
| React Query 패키지 | (없음) | `@tanstack/react-query: ^5.64.1`<br>`@tanstack/react-query-devtools: ^5.64.1` |

---

### 2.2 src/main.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { Provider } from "react-redux";<br>import { store } from "./store/store";<br><br>ReactDOM.createRoot(document.getElementById("root")!).render(<br>  <Provider store={store}><br>    <App /><br>  </Provider><br>);<br>``` |
| **TO-BE** | ```tsx<br>import { QueryClientProvider } from "@tanstack/react-query";<br>import { ReactQueryDevtools } from "@tanstack/react-query-devtools";<br>import { queryClient } from "./lib/queryClient";<br><br>ReactDOM.createRoot(document.getElementById("root")!).render(<br>  <QueryClientProvider client={queryClient}><br>    <App /><br>    <ReactQueryDevtools initialIsOpen={false} /><br>  </QueryClientProvider><br>);<br>``` |

---

### 2.3 src/App.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import ToastContainer from "@/components/common/ToastContainer";<br><br>function App() {<br>  return (<br>    <><br>      <AppRouter /><br>      <LoadingOverlay /><br>      <ToastContainer /><br>    </><br>  );<br>}<br>``` |
| **TO-BE** | ```tsx<br>import { ToastProvider } from '@/providers/ToastProvider';<br><br>function App() {<br>  return (<br>    <ToastProvider><br>      <AppRouter /><br>      <LoadingOverlay /><br>    </ToastProvider><br>  );<br>}<br>``` |

---

### 2.4 src/api/setupInterceptors.ts

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { store } from "@/store/store";<br>import { startLoading, stopLoading } from "@/store/slices/loadingSlice";<br>import { addToast } from "@/store/slices/toastSlice";<br><br>instance.interceptors.request.use((config) => {<br>  store.dispatch(startLoading());<br>  return config;<br>});<br><br>instance.interceptors.response.use(<br>  (response) => {<br>    store.dispatch(stopLoading());<br>    return response;<br>  },<br>  (error) => {<br>    store.dispatch(stopLoading());<br>    store.dispatch(addToast({ type: "error", text: message }));<br>    return Promise.reject(error);<br>  }<br>);<br>``` |
| **TO-BE** | ```tsx<br>import { showToast } from "@/providers/ToastProvider";<br><br>instance.interceptors.response.use(<br>  (response) => response,<br>  (error) => {<br>    if (status !== 401) {<br>      showToast({ type: "error", text: message });<br>    }<br>    return Promise.reject(error);<br>  }<br>);<br>``` |

---

### 2.5 src/components/common/LoadingOverlay.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { useAppSelector } from "@/store/hooks";<br><br>export default function LoadingOverlay() {<br>  const isLoading = useAppSelector((state) => state.loading.isLoading);<br>  if (!isLoading) return null;<br>  return (<div>...</div>);<br>}<br>``` |
| **TO-BE** | ```tsx<br>import { useIsFetching, useIsMutating } from "@tanstack/react-query";<br><br>export default function LoadingOverlay() {<br>  const isFetching = useIsFetching();<br>  const isMutating = useIsMutating();<br>  const isLoading = isFetching > 0 \|\| isMutating > 0;<br>  if (!isLoading) return null;<br>  return (<div>...</div>);<br>}<br>``` |

---

### 2.6 src/pages/AdminCategoryPage.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { useEffect, useState } from 'react';<br>import { fetchCategories, createCategory, ... } from '@/api/adminCategoryApi';<br>import { withToast } from '@/utils/withToast';<br><br>const [categories, setCategories] = useState<Category[]>([]);<br><br>const loadCategories = async () => {<br>  const data = await fetchCategories();<br>  setCategories(data);<br>};<br><br>useEffect(() => { loadCategories(); }, []);<br><br>const handleAdd = async () => {<br>  await createCategory(newCategory.trim());<br>  loadCategories();<br>};<br><br>const handleDelete = async (id: number) => {<br>  await withToast(deleteCategory(id), { success: '삭제 완료' });<br>};<br>``` |
| **TO-BE** | ```tsx<br>import {<br>  useCategories,<br>  useCreateCategory,<br>  useUpdateCategory,<br>  useDeleteCategory,<br>} from '@/hooks/queries/useCategories';<br><br>const { data: categories = [], isLoading } = useCategories();<br>const createMutation = useCreateCategory();<br>const deleteMutation = useDeleteCategory();<br><br>const handleAdd = () => {<br>  createMutation.mutate(newCategory.trim());<br>};<br><br>const handleConfirm = () => {<br>  deleteMutation.mutate(deleteTarget.id);<br>};<br>``` |

---

### 2.7 src/pages/AdminMemberPage.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { useEffect, useState } from "react";<br>import axiosAuthAdmin from "@/api/axiosAuthAdmin";<br><br>const [members, setMembers] = useState<MemberDTO[]>([]);<br><br>const fetchMembers = async () => {<br>  const res = await axiosAuthAdmin.get("/admin/members");<br>  setMembers(res.data);<br>};<br><br>useEffect(() => { fetchMembers(); }, []);<br><br>const toggleStatus = async (uuid, current) => {<br>  await axiosAuthAdmin.patch(...);<br>  fetchMembers();<br>};<br>``` |
| **TO-BE** | ```tsx<br>import {<br>  useMembers,<br>  useToggleMemberStatus,<br>  useToggleMemberDeleted,<br>} from '@/hooks/queries/useMembers';<br><br>const { data: members = [], isLoading } = useMembers();<br>const toggleStatusMutation = useToggleMemberStatus();<br><br>// 버튼 클릭 시<br>toggleStatusMutation.mutate({ uuid, currentStatus });<br>``` |

---

### 2.8 src/pages/AdminDashboardPage.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { useEffect, useState } from "react";<br>import axiosAuthAdmin from "@/api/axiosAuthAdmin";<br><br>const [adminInfo, setAdminInfo] = useState<AdminInfo \| null>(null);<br>const [error, setError] = useState<string \| null>(null);<br><br>useEffect(() => {<br>  const fetchAdminInfo = async () => {<br>    try {<br>      const res = await axiosAuthAdmin.get("/admin/me");<br>      setAdminInfo(res.data);<br>    } catch (err) {<br>      setError(err.response?.data?.message);<br>    }<br>  };<br>  fetchAdminInfo();<br>}, []);<br>``` |
| **TO-BE** | ```tsx<br>import { useAdminMe } from '@/hooks/queries/useAdminAuth';<br><br>const { data: adminInfo, isLoading, isError, error } = useAdminMe();<br>``` |

---

### 2.9 src/pages/AdminLoginPage.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { addToast } from '@store/slices/toastSlice';<br><br>// 버그: dispatch 없이 직접 호출<br>addToast({ text: 'reCAPTCHA 인증이 필요합니다.', type: 'error' });<br>``` |
| **TO-BE** | ```tsx<br>import { useToast } from "@/providers/ToastProvider";<br><br>const { addToast } = useToast();<br><br>addToast({ text: 'reCAPTCHA 인증이 필요합니다.', type: 'error' });<br>``` |

---

### 2.10 src/pages/UiTestPage.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { useDispatch } from "react-redux";<br>import { addToast } from "@/store/slices/toastSlice";<br>import { startLoading, stopLoading } from "@/store/slices/loadingSlice";<br><br>const dispatch = useDispatch();<br><br>const handleLoading = async () => {<br>  dispatch(startLoading());<br>  await new Promise((r) => setTimeout(r, 1500));<br>  dispatch(stopLoading());<br>};<br><br>const handleToast = () => {<br>  dispatch(addToast({ type: "success", text: "테스트!" }));<br>};<br>``` |
| **TO-BE** | ```tsx<br>import { useMutation } from "@tanstack/react-query";<br>import { useToast } from "@/providers/ToastProvider";<br><br>const { addToast } = useToast();<br><br>const loadingMutation = useMutation({<br>  mutationFn: () => new Promise((r) => setTimeout(r, 1500)),<br>});<br><br>const handleLoading = () => {<br>  loadingMutation.mutate();<br>};<br><br>const handleToast = () => {<br>  addToast({ type: "success", text: "테스트!" });<br>};<br>``` |

---

### 2.11 src/router/ProtectedAdminRoute.tsx

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```tsx<br>import { useEffect, useState } from "react";<br>import axiosAuthAdmin from "@/api/axiosAuthAdmin";<br><br>const [authorized, setAuthorized] = useState<boolean \| null>(null);<br><br>useEffect(() => {<br>  axiosAuthAdmin.get("/admin/me")<br>    .then((res) => {<br>      if (res.data.role === "ROLE_ADMIN") {<br>        setAuthorized(true);<br>      } else {<br>        setAuthorized(false);<br>      }<br>    })<br>    .catch(() => setAuthorized(false));<br>}, []);<br><br>if (authorized === null) return <div>인증 중...</div>;<br>if (!authorized) return <Navigate to="/admin/login" />;<br>return children;<br>``` |
| **TO-BE** | ```tsx<br>import { useAdminAuth } from '@/hooks/queries/useAdminAuth';<br><br>const { isAuthorized, isLoading, isError } = useAdminAuth();<br><br>if (isLoading) return <div>관리자 인증 중...</div>;<br>if (isError \|\| !isAuthorized) return <Navigate to="/admin/login" />;<br>return children;<br>``` |

---

### 2.12 vite.config.ts

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```ts<br>resolve: {<br>  alias: {<br>    '@': path.resolve(__dirname, './src'),<br>    '@store': path.resolve(__dirname, 'src/store'),<br>  },<br>},<br>``` |
| **TO-BE** | ```ts<br>resolve: {<br>  alias: {<br>    '@': path.resolve(__dirname, './src'),<br>  },<br>},<br>``` |

---

### 2.13 tsconfig.app.json

| 구분 | 코드 |
|------|------|
| **AS-IS** | ```json<br>"paths": {<br>  "@/*": ["src/*"],<br>  "@store/*": ["src/store/*"]<br>}<br>``` |
| **TO-BE** | ```json<br>"paths": {<br>  "@/*": ["src/*"]<br>}<br>``` |

---

## 3. 신규 생성 파일 상세

### 3.1 src/lib/queryClient.ts (신규)

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### 3.2 src/providers/ToastProvider.tsx (신규)

```typescript
// Context 기반 토스트 시스템
// - useToast() 훅 제공
// - showToast() 외부 함수 제공 (Axios 인터셉터용)
// - 3초 자동 제거 기능 내장
```

### 3.3 src/hooks/queries/useCategories.ts (신규)

```typescript
// useCategories() - 카테고리 목록 조회
// useCreateCategory() - 카테고리 생성
// useUpdateCategory() - 카테고리 수정
// useDeleteCategory() - 카테고리 삭제
```

### 3.4 src/hooks/queries/useMembers.ts (신규)

```typescript
// useMembers() - 회원 목록 조회
// useToggleMemberStatus() - 회원 상태 변경
// useToggleMemberDeleted() - 회원 탈퇴 상태 변경
```

### 3.5 src/hooks/queries/useAdminAuth.ts (신규)

```typescript
// useAdminMe() - 관리자 정보 조회
// useAdminAuth() - 인증 상태 확인 (isAuthorized, isLoading, isError)
```

---

## 4. 마이그레이션 요약

| 항목 | AS-IS | TO-BE |
|------|-------|-------|
| 상태 관리 | Redux Toolkit | React Query + Context API |
| 서버 상태 | useState + useEffect | useQuery / useMutation |
| 로딩 상태 | loadingSlice (Redux) | useIsFetching / useIsMutating |
| 토스트 | toastSlice (Redux) | ToastProvider (Context) |
| 캐싱 | 수동 구현 | React Query 자동 캐싱 |
| 데이터 리페치 | 수동 호출 | invalidateQueries 자동화 |
| 패키지 | @reduxjs/toolkit, react-redux | @tanstack/react-query |

---

*문서 생성일: 2026-01-18*
