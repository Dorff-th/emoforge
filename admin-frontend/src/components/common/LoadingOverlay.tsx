// src/components/LoadingOverlay.tsx
import { useAppSelector } from "@/store/hooks";

export default function LoadingOverlay() {
  const isLoading = useAppSelector((state) => state.loading.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-white"></div>
        <p className="mt-3 text-white">Loading...</p>
      </div>
    </div>
  );
}
