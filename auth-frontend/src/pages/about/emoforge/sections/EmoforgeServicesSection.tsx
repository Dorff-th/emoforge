const EmoforgeServicesSection = () => {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded bg-blue-600" />
            <h2 className="text-3xl font-semibold text-gray-900">
              기능별로 나눈 독립적인 서버 구조
            </h2>
          </div>

          <p className="mt-4 max-w-2xl text-gray-600">
            모든 기능을 하나의 서버에 담지 않고, 관리와 확장을 고려해 역할
            단위로 분리했습니다.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Auth Service */}
          <div className="rounded-xl border bg-gray-50 p-6">
            <h3 className="text-lg font-medium text-gray-900">인증 서버</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              사용자 인증과 권한 관리를 담당합니다. 인증 로직을 다른 기능과
              분리해, 보안과 책임 범위를 명확히 했습니다.
            </p>
          </div>

          {/* Data Service */}
          <div className="rounded-xl border bg-gray-50 p-6">
            <h3 className="text-lg font-medium text-gray-900">데이터 서버</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              기록 저장과 주요 비즈니스 데이터를 처리합니다. 데이터 구조와
              무결성에만 집중하도록 설계했습니다.
            </p>
          </div>

          {/* AI Service */}
          <div className="rounded-xl border bg-gray-50 p-6">
            <h3 className="text-lg font-medium text-gray-900">AI 분석 서버</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              AI 기능을 별도의 서버로 분리해, 실험과 확장이 다른 영역에 영향을
              주지 않도록 했습니다.
            </p>
          </div>
        </div>

        {/* Summary Line */}
        <div className="mt-16">
          <p className="text-lg font-medium text-gray-800">
            각 서버는 모든 것을 알지 않고, 자신의 책임에만 집중합니다.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmoforgeServicesSection;
