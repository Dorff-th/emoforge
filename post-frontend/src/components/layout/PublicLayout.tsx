import PublicHeader from "@/components/common/PublicHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="p-4">{children}</main>
    </>
  );
}
