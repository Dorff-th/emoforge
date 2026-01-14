const KakaoLoading = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-6">
      {/* Breathing Dot */}
      <div className="relative">
        <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        <div className="absolute inset-0 h-2 w-2 rounded-full bg-slate-400 animate-ping opacity-20" />
      </div>

      {/* Copy */}
      <p className="text-sm text-slate-500 tracking-wide">
        생각을 정리할 공간을 만들고 있어요
      </p>
    </div>
  );
};

export default KakaoLoading;
