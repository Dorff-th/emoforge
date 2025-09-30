import React from "react";
import AuthenticatedLayout from "./AuthenticatedLayout";
import PublicLayout from "./PublicLayout";
import { SERVICE_URLS } from "@/config/constants";

interface ConditionalLayoutRouteProps {
  status: "authenticated" | "idle" | "unauthenticated" | "loading" | "error";
  children: React.ReactNode;
  authRequired?: boolean; // ✅ 옵션 추가
}

const ConditionalLayoutRoute: React.FC<ConditionalLayoutRouteProps> = ({ status, children, authRequired }) => {

  
  if (authRequired && status !== "authenticated" && status !== "idle" && status !== "loading") {
    window.location.href = `${SERVICE_URLS.AUTH}/login?status=unauthorized`;
  }
  

  if (status === "idle" || status === "loading") {
    return <div>Loading...</div>;
  }

  if (authRequired && status !== "authenticated") {
    // ✅ redirect 진행 중이므로 아무것도 렌더링하지 않음
    return null;
  }

  if (status === "authenticated") {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // status === "unauthenticated"
  return <PublicLayout>{children}</PublicLayout>;
};

export default ConditionalLayoutRoute;