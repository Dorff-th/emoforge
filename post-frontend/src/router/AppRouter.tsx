import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { fetchProfile } from "@/store/slices/authSlice";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import ConditionalLayoutRoute from "@/components/layout/ConditionalLayoutRoute";
import PageListPage from "@/pages/PostListPage";
import PostDetail from '@/pages/PostDetail';
import TagPostListPage from "@/pages/TagPostListPage";
import PostWritePage from "@/pages/PostWritePage";
import PostEditPage from "@/pages/PostEditPage";


import UiTestPage from "@/pages/UiTestPage";

export default function AppRouter() {

  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  //const isAuthenticated = status === "authenticated";

  // Fetch profile only once on first load (avoid loop)
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  // Show loading indicator while fetching
  if (status === "loading") {
    return <div>Loading...</div>;
  }

    return (
        <BrowserRouter>
            <ConfirmDialogProvider>
            <Routes>
              <Route path="/ui-test" element={<UiTestPage />} />
              
              {/* 게시글 목록 */}
              <Route
                path="/posts"
                element={
                  <ConditionalLayoutRoute status={status}>
                    <PageListPage />
                  </ConditionalLayoutRoute>
                }
              />

              {/* 태그별 게시글 목록 */}    
              <Route
                path="/posts/tags/:tagName"
                element={
                  <ConditionalLayoutRoute status={status}>
                    <TagPostListPage />
                  </ConditionalLayoutRoute>
                }
              />
         
              {/* 게시글 상세 */}
              <Route
                path="/posts/:id"
                element={
                  <ConditionalLayoutRoute status={status}>
                    <PostDetail />
                  </ConditionalLayoutRoute>
                }
              />

              {/* 게시글 작성 */}
              <Route
                path="/posts/new"
                element={
                  <ConditionalLayoutRoute status={status} authRequired>
                    <PostWritePage />
                  </ConditionalLayoutRoute>
                }
              />

              {/* 게시글 수정 */}
              <Route
                path="/posts/:id/edit"
                element={ 
                  <ConditionalLayoutRoute status={status} authRequired>
                    <PostEditPage />
                  </ConditionalLayoutRoute>
                }
              />

              <Route path="*" element={<Navigate to="/posts" replace />} />
            </Routes>
            </ConfirmDialogProvider>
        </BrowserRouter>
    );

}    