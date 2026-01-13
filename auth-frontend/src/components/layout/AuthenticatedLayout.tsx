// src/components/layout/AuthenticatedLayout.tsx
import Header from "@/components/common/header/Header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="p-4">{children}</main>
    </>
  );
}
