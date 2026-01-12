// src/pages/about/emoforge/sections/EmoforgeIntroSection.tsx

const EmoforgeIntroSection = () => {
  return (
    <section className="min-h-[80vh] flex items-center bg-white">
      <div className="mx-auto max-w-5xl px-6 text-center">
        {/* What */}
        <h1 className="text-5xl font-bold text-gray-900">Emoforge</h1>

        {/* Why */}
        <p className="mt-6 text-xl text-gray-500">
          공부용이 아닌, 실제로 사용하기 위해 만든 개인 서비스입니다.
        </p>

        {/* Who */}
        <p className="mt-4 text-base text-gray-600">
          혼자 개발하지만, 나 자신과 같은 기록형 사용자를 염두에 두고
          설계했습니다.
        </p>

        {/* How */}
        <p className="mt-10 text-lg font-medium text-blue-600">
          기능보다 구조를 먼저 설계하는 실험입니다.
        </p>

        {/* How + Where */}
        <p className="mt-6 text-base text-gray-600">
          Spring Boot와 React, Docker 기반으로 서비스를 분리하고 실제 운영
          환경을 가정해 구현했습니다.
        </p>

        {/* When */}
        <p className="mt-4 text-base text-gray-500">
          매일의 감정 기록과 회고, 그리고 장기적인 실험을 위해 계속 사용
          중입니다.
        </p>
      </div>
    </section>
  );
};

export default EmoforgeIntroSection;
