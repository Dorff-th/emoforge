// src/pages/about/emoforge/sections/EmoforgeIntroSection.tsx

const EmoforgeIntroSection = () => {
  return (
    <section className="min-h-[80vh] flex items-center bg-white">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-900">Emoforge</h1>

        <p className="mt-6 text-xl text-gray-500">
          개인 프로젝트지만, 실제 서비스를 만들듯 설계했습니다.
        </p>

        <p className="mt-10 text-lg font-medium text-blue-600">
          기능보다 구조를 먼저 설계하는 실험입니다.
        </p>

        <p className="mt-6 text-base text-gray-600">
          서비스를 어떻게 나누고, 어떻게 운영할 것인가를 먼저 고민했습니다.
        </p>
      </div>
    </section>
  );
};

export default EmoforgeIntroSection;
