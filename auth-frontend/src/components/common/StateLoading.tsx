// components/common/StateLoading.tsx

const StateLoading = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-gray-500">
      {/* dots */}
      <div className="flex gap-1 text-2xl font-medium">
        <span className="animate-bounce [animation-delay:-0.3s]">.</span>
        <span className="animate-bounce [animation-delay:-0.15s]">.</span>
        <span className="animate-bounce">.</span>
      </div>

      {/* status text */}
      <p className="text-sm tracking-wide">Preparing session</p>
    </div>
  );
};

export default StateLoading;
