import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";

export default function Demo() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <HeroSection
        title="See TalentMatch AI in Action"
        subtitle="Watch how AI transforms hiring in real-time"
        hideButtons={true}
      />

      <div className="py-12 text-center">
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl">
          Request Live Demo
        </button>
      </div>

      <FeaturesSection />
    </div>
  );
}