const EmoforgeProblemSection = () => {
  return (
    <section className="bg-gray-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded bg-blue-600" />
            <h2 className="text-3xl font-semibold text-gray-900">
              개인 프로젝트에서 늘 마주치던 문제
            </h2>
          </div>

          <p className="mt-4 max-w-2xl text-gray-600">
            기능이 늘어날수록 구조는 복잡해지고, 관리 비용은 점점 커졌습니다.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900">가시성 부족</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              요청이 어디서 시작되고 어디로 흐르는지 한눈에 파악하기
              어려웠습니다. 기능이 추가될수록 구조는 점점 보이지 않게
              되었습니다.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900">책임의 혼재</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              화면과 서버의 역할이 섞이면서, 작은 수정 하나가 전체 코드에 영향을
              주는 구조가 되었습니다.
            </p>
          </div>
        </div>

        {/* Highlight Question */}
        <div className="mt-16">
          <p className="text-lg font-medium text-gray-800">
            “지금은 동작하지만, 나중에도 이 구조를 관리할 수 있을까?”
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmoforgeProblemSection;
