// src/components/layout/AuthenticatedLayout.tsx
import AuthenticatedHeader from "@/components/common/AuthenticatedHeader";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthenticatedHeader />
      <main className="p-4">{children}</main>
    </>
  );
}
