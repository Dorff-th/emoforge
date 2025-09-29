import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import PageListPage from "@/pages/PostListPage";
import PostDetail from '@/pages/PostDetail';
import TagPostListPage from "@/pages/TagPostListPage";
import PostWritePage from "@/pages/PostWritePage";


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
                {/* <Route path="/ui-test" element={<UiTestPage />} /> */}

              <Route
                path="/ui-test"
                element={
                  status === "authenticated" ? (
                    <AuthenticatedLayout>
                      <UiTestPage />
                    </AuthenticatedLayout>
                    ) : status === "idle" ? (
                      <div>Loading...</div>
                    ) : (
                     (() => {
                      //window.location.href = `${SERVICE_URLS.AUTH}/login`;
                      return null; // JSX 반환 막음
                      })()
                    )
                  }
                />

              <Route path="/posts" element={<PageListPage />} />
              <Route path="/posts/tags/:tagName"element={<TagPostListPage />}/>
         
              <Route path="/posts/:id" element={<PostDetail />} />

              <Route
                path="/posts/new"
                element={
                  status === "authenticated" ? (
                    <AuthenticatedLayout>
                      <PostWritePage />
                    </AuthenticatedLayout>
                    ) : status === "idle" ? (
                      <div>Loading...</div>
                    ) : (
                     (() => {
                      //window.location.href = `${SERVICE_URLS.AUTH}/login`;
                      return null; // JSX 반환 막음
                      })()
                    )
                  }
                />

                <Route path="*" element={<Navigate to="/ui-test" replace />} />
            </Routes>
            </ConfirmDialogProvider>
        </BrowserRouter>
    );

}    