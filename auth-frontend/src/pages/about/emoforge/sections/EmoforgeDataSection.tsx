const EmoforgeDataSection = () => {
  return (
    <section className="bg-gray-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded bg-blue-600" />
            <h2 className="text-3xl font-semibold text-gray-900">
              데이터는 구조의 중심입니다
            </h2>
          </div>

          <p className="mt-4 max-w-2xl text-gray-600">
            서버는 교체될 수 있지만, 데이터는 항상 보호되어야 한다고
            생각했습니다.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-12 md:grid-cols-2 items-center">
          {/* Left: Message */}
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Emoforge에서는 서버가 일시적으로 중단되거나 구조가 변경되더라도,
              데이터의 무결성과 연속성은 유지되어야 한다는 전제를 두고
              설계했습니다.
            </p>

            <p className="text-gray-700 leading-relaxed">
              기능 확장이나 실험은 언제든 가능하지만, 이미 쌓인 기록과 데이터는
              그 과정에서 손상되지 않아야 합니다.
            </p>
          </div>

          {/* Right: Storage Placeholder */}
          <div className="rounded-xl border bg-white p-10 text-gray-400 flex items-center justify-center">
            Database / Storage Concept
          </div>
        </div>

        {/* Summary Line */}
        <div className="mt-16">
          <p className="text-lg font-medium text-gray-800">
            그래서 Emoforge의 설계 기준은 항상 데이터 보호를 중심에 두고
            결정되었습니다.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmoforgeDataSection;
