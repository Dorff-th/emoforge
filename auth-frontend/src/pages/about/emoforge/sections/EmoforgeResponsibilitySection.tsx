const EmoforgeResponsibilitySection = () => {
  return (
    <section className="bg-gray-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded bg-blue-600" />
            <h2 className="text-3xl font-semibold text-gray-900">
              화면과 서버의 역할 분리
            </h2>
          </div>

          <p className="mt-4 max-w-2xl text-gray-600">
            구조가 유지되기 위해서는, 각 영역이 자신의 책임에만 집중해야 한다고
            생각했습니다.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-12 md:grid-cols-2 items-start">
          {/* Left: Principles */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">화면의 역할</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                웹 화면은 사용자의 요청을 전달하고, 서버가 반환한 결과를
                표현하는 역할에 집중합니다. 비즈니스 로직은 화면에 포함하지
                않습니다.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">서버의 역할</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                데이터 처리와 핵심 로직은 서버에서만 수행합니다. 이를 통해 화면
                변경이 서버 구조에 영향을 주지 않도록 했습니다.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">책임 분리의 효과</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                책임이 섞이지 않으면서, 기능 추가나 수정 시 구조가 무너지지 않는
                기반을 만들 수 있었습니다.
              </p>
            </div>
          </div>

          {/* Right: Diagram Placeholder */}
          <div className="rounded-xl border bg-white p-10 text-gray-400 flex items-center justify-center">
            Screen ↔ Server Responsibility Diagram
          </div>
        </div>

        {/* Summary Line */}
        <div className="mt-16">
          <p className="text-lg font-medium text-gray-800">
            그래서, 기능이 늘어나도 구조는 흔들리지 않도록 설계했습니다.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmoforgeResponsibilitySection;
