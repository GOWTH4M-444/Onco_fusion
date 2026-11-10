import React from 'react';
import {
  Activity,
  Layers,
  TrendingDown,
  Users,
  Calculator,
  Dna,
  GitCompare,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { CANCER_COHORTS } from '../data/tcgaData';

export type ActiveTab =
  | 'welcome'
  | 'benchmark'
  | 'model_comparison'
  | 'fusion'
  | 'kaplan_meier'
  | 'cohort'
  | 'calculator';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCohort: string;
  setSelectedCohort: (cohort: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCohort,
  setSelectedCohort,
}) => {
  const isLandingPage = activeTab === 'welcome';

  const workspaceNavItems = [
    { id: 'benchmark' as ActiveTab, label: 'Pan-Cancer Benchmark', icon: Activity },
    { id: 'model_comparison' as ActiveTab, label: 'Model Comparison', icon: GitCompare },
    { id: 'fusion' as ActiveTab, label: '3D Fusion & Weights', icon: Layers },
    { id: 'kaplan_meier' as ActiveTab, label: 'Kaplan-Meier Curves', icon: TrendingDown },
    { id: 'cohort' as ActiveTab, label: 'Patient Explorer', icon: Users },
    { id: 'calculator' as ActiveTab, label: 'Risk & Milestones', icon: Calculator },
  ];

  return (
    <header className="border-b border-[#E6E1D6] bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Logo & TCGA Cohort Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('welcome')}
              className="flex items-center gap-3 text-left cursor-pointer group"
              title="Return to OncoFusion Welcome Overview"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5F0E6] border border-[#E6E1D6] shadow-2xs flex items-center justify-center text-[#A6634B] group-hover:border-[#A6634B]/40 transition-colors">
                <Dna className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg tracking-tight text-[#2D2926]">
                    OncoFusion
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F6EDE9] text-[#A6634B] border border-[#A6634B]/25">
                    TCGA Multi-Omics
                  </span>
                </div>
                <p className="text-xs text-[#78716C] hidden sm:block">
                  Pan-Cancer Survival Prediction &amp; Clinical Decision Support
                </p>
              </div>
            </button>
          </div>

          {/* Right: Conditional Controls based on Landing Page vs Workspace View */}
          {isLandingPage ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E6E1D6] rounded-xl text-xs shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#A6634B]" />
                <span className="text-[#78716C]">8 TCGA Cohorts</span>
                <span className="text-[#E6E1D6]">•</span>
                <span className="font-mono font-bold text-[#2D2926]">C-index 0.785</span>
              </div>

              <button
                onClick={() => setActiveTab('benchmark')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A6634B] hover:bg-[#8E523D] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <label htmlFor="cohort-select" className="text-xs text-[#78716C] font-medium hidden md:inline">
                Cancer Cohort:
              </label>
              <div className="relative">
                <select
                  id="cohort-select"
                  aria-label="Select TCGA Cancer Cohort"
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="bg-white text-xs font-semibold text-[#2D2926] border border-[#E6E1D6] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#A6634B]/30 cursor-pointer shadow-2xs pr-8 appearance-none hover:border-[#D6CFBE] transition-colors"
                >
                  {Object.values(CANCER_COHORTS).map((c) => (
                    <option key={c.code} value={c.code} className="bg-white text-[#2D2926]">
                      {c.code === 'ALL' ? 'All Cohorts (Pooled Pan-Cancer)' : `${c.code} - ${c.name}`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#78716C]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Benchmark Top Metric Pill */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white border border-[#E6E1D6] rounded-lg text-xs shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#A6634B]" />
                <span className="text-[#78716C]">Multimodal Fusion:</span>
                <span className="font-mono font-bold text-[#2D2926]">C-index 0.785</span>
                <span className="text-[11px] text-[#5B7065] font-semibold">(+15.1% vs Clinical)</span>
              </div>
            </div>
          )}
        </div>

        {/* Progressive Disclosure: Horizontal Scrolling Workspace Tab Bar (Hidden on Welcome Landing Page) */}
        {!isLandingPage && (
          <nav
            className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-2.5 pt-1.5 border-t border-[#E6E1D6]/70"
            aria-label="Main Navigation"
          >
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <button
                onClick={() => setActiveTab('welcome')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#78716C] hover:text-[#2D2926] hover:bg-[#F5F0E6] border border-transparent whitespace-nowrap transition-all cursor-pointer mr-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#A6634B]" />
                <span>Back to Overview</span>
              </button>

              <div className="h-4 w-[1px] bg-[#E6E1D6] mx-1 hidden sm:block" />

              {workspaceNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                        : 'text-[#78716C] hover:text-[#2D2926] hover:bg-[#F5F0E6] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A6634B]' : 'text-[#78716C]'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
