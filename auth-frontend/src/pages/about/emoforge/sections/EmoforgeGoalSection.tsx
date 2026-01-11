const EmoforgeGoalSection = () => {
  return (
    <section className="bg-white py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Title */}
        <h2 className="text-4xl font-semibold text-gray-900">
          Emoforge Architecture Goal
        </h2>

        {/* Core Messages */}
        <p className="mt-10 text-lg leading-relaxed text-gray-700">
          Emoforge는 최신 기술을 보여주기 위한 프로젝트가 아닙니다.
          <br />
          이해할 수 있고, 설명할 수 있는 구조를 만드는 것을 목표로 했습니다.
        </p>

        <p className="mt-6 text-lg leading-relaxed text-gray-700">
          혼자 개발하더라도, 시간이 지나도 유지할 수 있는 구조를 고민했습니다.
        </p>

        {/* Final Statement */}
        <p className="mt-12 text-xl font-medium text-blue-600">
          작게 시작했지만, 오래 갈 수 있는 구조.
        </p>
      </div>
    </section>
  );
};

export default EmoforgeGoalSection;
