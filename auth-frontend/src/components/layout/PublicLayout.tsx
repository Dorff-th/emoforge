import { Outlet } from "react-router-dom";
import PublicHeader from "@/components/common/PublicHeader";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-white">
      <PublicHeader />

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
