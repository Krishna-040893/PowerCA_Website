import { HeroSection } from "./components/HeroSection";
import { ModulesSection } from "./components/ModulesSection";

export default function App() {
  return (
    <div className="bg-white min-h-screen relative">
      <HeroSection />
      <ModulesSection />
    </div>
  );
}