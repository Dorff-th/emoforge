const EmoforgeOverviewSection = () => {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded bg-blue-600" />
            <h2 className="text-3xl font-semibold text-gray-900">
              Emoforge 전체 구조 한눈에 보기
            </h2>
          </div>

          <p className="mt-4 max-w-2xl text-gray-600">
            내부 구조는 나뉘어 있지만, 사용자가 마주하는 흐름은 단순합니다.
          </p>
        </div>

        {/* Flow Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-gray-50 p-6">
            <h3 className="text-lg font-medium text-gray-900">사용자</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              웹 화면을 통해 기능을 이용합니다. 내부 구조를 알 필요는 없습니다.
            </p>
          </div>

          <div className="rounded-xl border bg-gray-50 p-6">
            <h3 className="text-lg font-medium text-gray-900">Frontend</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              요청을 전달하고 결과를 보여주는 역할에 집중합니다.
            </p>
          </div>

          <div className="rounded-xl border bg-gray-50 p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Backend & Storage
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              서버는 요청을 처리하고, 데이터는 안전하게 저장됩니다.
            </p>
          </div>
        </div>

        {/* Summary Line */}
        <div className="mt-16">
          <p className="text-lg font-medium text-gray-800">
            사용자는 복잡한 구조를 몰라도, 모든 기능을 자연스럽게 사용할 수
            있습니다.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmoforgeOverviewSection;
