import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export default function LoadingOverlay() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0 || isMutating > 0;

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
