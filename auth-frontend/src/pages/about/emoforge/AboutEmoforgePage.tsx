import EmoforgeIntroSection from "./sections/EmoforgeIntroSection";
import EmoforgeProblemSection from "./sections/EmoforgeProblemSection";
import EmoforgeOverviewSection from "./sections/EmoforgeOverviewSection";
import EmoforgeResponsibilitySection from "./sections/EmoforgeResponsibilitySection";
import EmoforgeServicesSection from "./sections/EmoforgeServicesSection";
import EmoforgeDataSection from "./sections/EmoforgeDataSection";
import EmoforgeGoalSection from "./sections/EmoforgeGoalSection";

const AboutEmoforgePage = () => {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* Main Content */}
      <main className="flex flex-col">
        <EmoforgeIntroSection />
        <EmoforgeProblemSection />
        <EmoforgeOverviewSection />
        <EmoforgeResponsibilitySection />
        <EmoforgeServicesSection />
        <EmoforgeDataSection />
        <EmoforgeGoalSection />
      </main>
    </div>
  );
};

export default AboutEmoforgePage;
