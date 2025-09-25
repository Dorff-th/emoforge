import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfirmDialogProvider } from "@/providers/ConfirmDialogProvider";
import UiTestPage from "@/pages/UiTestPage";

export default function AppRouter() {

    return (
        <BrowserRouter>
            <ConfirmDialogProvider>
            <Routes>
                <Route path="/ui-test" element={<UiTestPage />} />
                <Route path="*" element={<Navigate to="/ui-test" replace />} />
            </Routes>
            </ConfirmDialogProvider>
        </BrowserRouter>
    );

}    