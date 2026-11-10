import React, { useState, useMemo } from 'react';
import { Calendar, ShieldAlert, HeartPulse, CheckCircle2, Sparkles, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export const MilestoneSimulator: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<1 | 3 | 5>(3);

  // Patient inputs
  const [patientStage, setPatientStage] = useState<number>(2); // 0=I, 1=II, 2=III, 3=IV
  const [patientAge, setPatientAge] = useState<number>(58);
  const [cellProliferation, setCellProliferation] = useState<number>(65); // High Ki-67 %
  const [immuneInfiltration, setImmuneInfiltration] = useState<number>(45); // High TILs %
  const [hasProtectiveMark, setHasProtectiveMark] = useState<boolean>(true); // MGMT or High TMB

  const stages = ['Stage I (Localized)', 'Stage II (Early Spread)', 'Stage III (Regional Nodes)', 'Stage IV (Metastatic)'];

  // Calculate survival probabilities at 1, 3, 5 years
  const { prob1Yr, prob3Yr, prob5Yr, overallHazardText } = useMemo(() => {
    // Risk score calculation
    let hazard = 0.0;
    hazard += (patientStage - 1.5) * 0.75;
    hazard += (patientAge - 55) * 0.02;
    hazard += (cellProliferation - 50) * 0.015;
    hazard -= (immuneInfiltration - 40) * 0.018;
    if (hasProtectiveMark) hazard -= 0.45;

    const baseSurv1 = 0.92;
    const baseSurv3 = 0.76;
    const baseSurv5 = 0.62;

    const mult = Math.exp(Math.max(-2.2, Math.min(2.2, hazard)));

    const p1 = Math.round(Math.max(5, Math.min(99, Math.pow(baseSurv1, mult) * 100)));
    const p3 = Math.round(Math.max(3, Math.min(98, Math.pow(baseSurv3, mult) * 100)));
    const p5 = Math.round(Math.max(2, Math.min(96, Math.pow(baseSurv5, mult) * 100)));

    let text = 'Moderate Hazard: Balanced risk profile with actionable immune activity.';
    if (hazard > 0.8) {
      text = 'Elevated Hazard: Aggressive tumor traits indicate closer clinical monitoring and combination therapy.';
    } else if (hazard < -0.4) {
      text = 'Favorable Outlook: Strong immune defense and early anatomical stage indicate excellent prognosis.';
    }

    return { prob1Yr: p1, prob3Yr: p3, prob5Yr: p5, overallHazardText: text };
  }, [patientStage, patientAge, cellProliferation, immuneInfiltration, hasProtectiveMark]);

  const activeProb = selectedMilestone === 1 ? prob1Yr : selectedMilestone === 3 ? prob3Yr : prob5Yr;

  return (
    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-lg font-bold text-[#2D2926]">
              Milestone Prognostic Simulator
            </h3>
          </div>
          <p className="text-xs text-[#78716C]">
            Select a clinical milestone horizon to see how multi-omics traits shape 1-year, 3-year, and 5-year survival likelihoods.
          </p>
        </div>

        {/* Milestone Buttons */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#E6E1D6]">
          {[1, 3, 5].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedMilestone(yr as 1 | 3 | 5)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMilestone === yr
                  ? 'bg-white text-[#A6634B] shadow-xs border border-[#E6E1D6]'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              {yr}-Year Horizon
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#2D2926]">Tumor Stage:</span>
              <span className="font-mono text-[#A6634B] font-bold">{stages[patientStage]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              value={patientStage}
              onChange={(e) => setPatientStage(Number(e.target.value))}
              className="w-full bg-[#E6E1D6] h-2 rounded-lg cursor-pointer accent-[#A6634B]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#2D2926]">Patient Age:</span>
              <span className="font-mono text-[#2D2926] font-bold">{patientAge} years</span>
            </div>
            <input
              type="range"
              min="35"
              max="85"
              value={patientAge}
              onChange={(e) => setPatientAge(Number(e.target.value))}
              className="w-full bg-[#E6E1D6] h-2 rounded-lg cursor-pointer accent-[#8C7B6B]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#2D2926]">Cell Growth & Proliferation (Ki-67):</span>
              <span className="font-mono text-[#A6634B] font-bold">{cellProliferation}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              value={cellProliferation}
              onChange={(e) => setCellProliferation(Number(e.target.value))}
              className="w-full bg-[#E6E1D6] h-2 rounded-lg cursor-pointer accent-[#A6634B]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#2D2926]">Tumor-Infiltrating Immune Cells (TILs):</span>
              <span className="font-mono text-[#5B7065] font-bold">{immuneInfiltration}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              value={immuneInfiltration}
              onChange={(e) => setImmuneInfiltration(Number(e.target.value))}
              className="w-full bg-[#E6E1D6] h-2 rounded-lg cursor-pointer accent-[#5B7065]"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2D2926] font-medium bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6E1D6]">
              <input
                type="checkbox"
                checked={hasProtectiveMark}
                onChange={(e) => setHasProtectiveMark(e.target.checked)}
                className="rounded border-[#D9D2C5] text-[#5B7065] focus:ring-[#5B7065]"
              />
              <span>Patient carries positive biomarker (e.g. Chemosensitive MGMT or High TMB)</span>
            </label>
          </div>
        </div>

        {/* Milestone Display (5 cols) */}
        <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-5 text-center space-y-4">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider text-[#78716C] block">
              Estimated {selectedMilestone}-Year Survival Likelihood
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <span className="font-serif text-5xl font-extrabold text-[#2D2926]">
                {activeProb}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-[#E6E1D6] rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                activeProb >= 70 ? 'bg-[#5B7065]' : activeProb >= 40 ? 'bg-[#8C7B6B]' : 'bg-[#A6634B]'
              }`}
              style={{ width: `${activeProb}%` }}
            />
          </div>

          {/* Milestone timeline summary */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E6E1D6] text-center text-xs">
            <div
              onClick={() => setSelectedMilestone(1)}
              className={`p-2 rounded-lg cursor-pointer ${
                selectedMilestone === 1 ? 'bg-white border border-[#E6E1D6] font-bold' : 'opacity-70'
              }`}
            >
              <span className="text-[10px] text-[#78716C] block">1 Year</span>
              <span className="font-mono text-sm text-[#2D2926]">{prob1Yr}%</span>
            </div>

            <div
              onClick={() => setSelectedMilestone(3)}
              className={`p-2 rounded-lg cursor-pointer ${
                selectedMilestone === 3 ? 'bg-white border border-[#E6E1D6] font-bold' : 'opacity-70'
              }`}
            >
              <span className="text-[10px] text-[#78716C] block">3 Years</span>
              <span className="font-mono text-sm text-[#2D2926]">{prob3Yr}%</span>
            </div>

            <div
              onClick={() => setSelectedMilestone(5)}
              className={`p-2 rounded-lg cursor-pointer ${
                selectedMilestone === 5 ? 'bg-white border border-[#E6E1D6] font-bold' : 'opacity-70'
              }`}
            >
              <span className="text-[10px] text-[#78716C] block">5 Years</span>
              <span className="font-mono text-sm text-[#2D2926]">{prob5Yr}%</span>
            </div>
          </div>

          <p className="text-[11px] text-[#78716C] italic leading-relaxed">
            {overallHazardText}
          </p>
        </div>
      </div>
    </div>
  );
};
