import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { WelcomeHeroView } from './components/WelcomeHeroView';
import { BenchmarkView } from './components/BenchmarkView';
import { ModelComparisonView } from './components/ModelComparisonView';
import { FusionEngineView } from './components/FusionEngineView';
import { KaplanMeierView } from './components/KaplanMeierView';
import { CohortExplorerView } from './components/CohortExplorerView';
import { PatientRiskCalculatorView } from './components/PatientRiskCalculatorView';
import { Dna, GitCompare, Activity, Layers, Calculator, TrendingDown } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('welcome');
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2926] flex flex-col font-sans selection:bg-[#A6634B]/20 selection:text-[#2D2926]">
      {/* Conditionally render Top Navigation only when inside workspace modules */}
      {activeTab !== 'welcome' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCohort={selectedCohort}
          setSelectedCohort={setSelectedCohort}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {activeTab === 'welcome' && <WelcomeHeroView onLaunchTab={setActiveTab} />}
        {activeTab === 'benchmark' && <BenchmarkView selectedCohort={selectedCohort} />}
        {activeTab === 'model_comparison' && <ModelComparisonView />}
        {activeTab === 'fusion' && <FusionEngineView selectedCohort={selectedCohort} />}
        {activeTab === 'kaplan_meier' && <KaplanMeierView selectedCohort={selectedCohort} />}
        {activeTab === 'cohort' && <CohortExplorerView selectedCohort={selectedCohort} />}
        {activeTab === 'calculator' && <PatientRiskCalculatorView />}
      </main>

      {/* Bottom Editorial Footer */}
      <footer className="border-t border-[#E6E1D6] bg-[#FAF7F2] py-8 text-xs text-[#78716C] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#F5F0E6] border border-[#E6E1D6] flex items-center justify-center text-[#A6634B]">
              <Dna className="w-3.5 h-3.5" />
            </div>
            <span className="font-serif font-bold text-[#2D2926]">OncoFusion</span>
            <span>— Pan-Cancer Multi-Omics Survival Prediction &amp; Clinical Decision Support</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#78716C]">
            <button
              onClick={() => setActiveTab('benchmark')}
              className="hover:text-[#A6634B] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Benchmark</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('model_comparison')}
              className="hover:text-[#A6634B] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Model Comparison</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('fusion')}
              className="hover:text-[#A6634B] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Fusion &amp; Weights</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('kaplan_meier')}
              className="hover:text-[#A6634B] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Kaplan-Meier</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('calculator')}
              className="text-[#A6634B] hover:text-[#8E523D] transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Milestone Simulator</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
