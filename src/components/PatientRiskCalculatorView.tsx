import React, { useState, useMemo } from 'react';
import {
  Calculator,
  HeartPulse,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { predictMultimodalRisk, ModalityType } from '../utils/fusion';
import { MilestoneSimulator } from './MilestoneSimulator';

export const PatientRiskCalculatorView: React.FC = () => {
  const [calculatorTab, setCalculatorTab] = useState<'calculator' | 'milestones'>('calculator');

  // Clinical inputs
  const [age, setAge] = useState<number>(62);
  const [stageIdx, setStageIdx] = useState<number>(2); // 0=Stage I, 1=II, 2=III, 3=IV
  const [karnofsky, setKarnofsky] = useState<number>(80);

  // mRNA Z-scores
  const [mki67, setMki67] = useState<number>(1.2);
  const [tp53, setTp53] = useState<number>(0.8);
  const [cd8a, setCd8a] = useState<number>(0.2);
  const [pdl1, setPdl1] = useState<number>(1.4);

  // microRNA
  const [mir21, setMir21] = useState<number>(13.5);
  const [mir34a, setMir34a] = useState<number>(9.0);

  // DNA Methylation
  const [mgmtMeth, setMgmtMeth] = useState<number>(0.35);
  const [cdkn2aMeth, setCdkn2aMeth] = useState<number>(0.55);

  // Genomics & Pathology
  const [tmb, setTmb] = useState<number>(14.5);
  const [hrdScore, setHrdScore] = useState<number>(38);
  const [tilDensity, setTilDensity] = useState<number>(45);

  const stages = ['Stage I (Localized)', 'Stage II (Regional)', 'Stage III (Lymph Nodes)', 'Stage IV (Metastatic)'];

  // Presets
  const applyPreset = (presetName: string) => {
    if (presetName === 'melanoma_immuno') {
      setAge(54);
      setStageIdx(3);
      setKarnofsky(90);
      setMki67(1.4);
      setTp53(0.1);
      setCd8a(2.2);
      setPdl1(2.5);
      setMir21(12.0);
      setMir34a(10.5);
      setMgmtMeth(0.1);
      setCdkn2aMeth(0.3);
      setTmb(32.0);
      setHrdScore(22);
      setTilDensity(70);
    } else if (presetName === 'gbm_high_hazard') {
      setAge(68);
      setStageIdx(3);
      setKarnofsky(60);
      setMki67(2.4);
      setTp53(1.8);
      setCd8a(-0.8);
      setPdl1(0.2);
      setMir21(15.2);
      setMir34a(7.1);
      setMgmtMeth(0.05); // unmethylated
      setCdkn2aMeth(0.85); // deleted/methylated
      setTmb(3.2);
      setHrdScore(14);
      setTilDensity(10);
    } else if (presetName === 'brca_luminal_favorable') {
      setAge(51);
      setStageIdx(0);
      setKarnofsky(100);
      setMki67(-0.9);
      setTp53(-0.6);
      setCd8a(0.9);
      setPdl1(0.8);
      setMir21(11.2);
      setMir34a(11.8);
      setMgmtMeth(0.4);
      setCdkn2aMeth(0.2);
      setTmb(6.5);
      setHrdScore(18);
      setTilDensity(55);
    }
  };

  // Compute prediction
  const prediction = useMemo(() => {
    const features: Record<ModalityType, number[]> = {
      clinical: [(age - 60) / 15, stageIdx - 1.5, -(karnofsky - 80) / 20],
      mrna: [mki67, tp53, -cd8a, -pdl1],
      mirna: [(mir21 - 12) * 0.3, -(mir34a - 9.5) * 0.25],
      methylation: [-(mgmtMeth - 0.3) * 0.8, (cdkn2aMeth - 0.3) * 0.9],
      cnv_mutation: [-(tmb > 10 ? 0.4 : -0.2), -(hrdScore > 42 ? 0.3 : 0.0)],
      pathology: [-(tilDensity / 100) * 0.9],
    };

    const weights: Record<ModalityType, number[]> = {
      clinical: [1.0, 1.2, 0.9],
      mrna: [0.55, 0.45, 0.5, 0.3],
      mirna: [0.6, 0.5],
      methylation: [0.8, 0.7],
      cnv_mutation: [0.6, 0.5],
      pathology: [0.8],
    };

    const modContributionWeights: Record<ModalityType, number> = {
      clinical: 1.0,
      mrna: 1.1,
      mirna: 0.8,
      methylation: 0.9,
      cnv_mutation: 0.85,
      pathology: 0.95,
    };

    return predictMultimodalRisk(features, weights, modContributionWeights);
  }, [age, stageIdx, karnofsky, mki67, tp53, cd8a, pdl1, mir21, mir34a, mgmtMeth, cdkn2aMeth, tmb, hrdScore, tilDensity]);

  const riskCategory =
    prediction.totalRiskScore > 1.2
      ? { label: 'High Survival Hazard (Aggressive Outlook)', color: 'text-[#A6634B] bg-[#F6EDE9] border-[#A6634B]/30' }
      : prediction.totalRiskScore < -0.4
      ? { label: 'Low Survival Hazard (Favorable Outlook)', color: 'text-[#5B7065] bg-[#EEF2F0] border-[#5B7065]/30' }
      : { label: 'Intermediate Survival Hazard (Standard Outlook)', color: 'text-[#8C7B6B] bg-[#FAF7F2] border-[#E6E1D6]' };

  return (
    <div className="space-y-6">
      {/* Top Banner & Archetypes */}
      <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
              <Calculator className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Individual Prognostics
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2926] tracking-tight">
            Patient Risk & Milestone Simulator
          </h2>
          <p className="text-xs text-[#78716C] mt-1 max-w-2xl leading-relaxed">
            Estimate individual patient risk and calculate 1-, 3-, and 5-year survival probabilities by adjusting clinical and molecular biomarker traits.
          </p>
        </div>

        {/* View Switcher & Archetypes */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E6E1D6] p-1.5 rounded-xl">
            <button
              onClick={() => setCalculatorTab('calculator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                calculatorTab === 'calculator'
                  ? 'bg-white text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              Precision Calculator
            </button>
            <button
              onClick={() => setCalculatorTab('milestones')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                calculatorTab === 'milestones'
                  ? 'bg-white text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              Milestone Timeline
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#78716C] font-medium hidden lg:inline">Archetypes:</span>
            <button
              onClick={() => applyPreset('melanoma_immuno')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAF7F2] border border-[#E6E1D6] hover:border-[#D6CFBE] text-[#2D2926] cursor-pointer"
            >
              Melanoma (Immune)
            </button>
            <button
              onClick={() => applyPreset('gbm_high_hazard')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAF7F2] border border-[#E6E1D6] hover:border-[#D6CFBE] text-[#2D2926] cursor-pointer"
            >
              GBM (High Hazard)
            </button>
            <button
              onClick={() => applyPreset('brca_luminal_favorable')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAF7F2] border border-[#E6E1D6] hover:border-[#D6CFBE] text-[#2D2926] cursor-pointer"
            >
              Early BRCA
            </button>
          </div>
        </div>
      </div>

      {calculatorTab === 'milestones' && <MilestoneSimulator />}

      {/* Main Grid: Controls vs Live Prediction */}
      {calculatorTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sliders & Biomarker Inputs (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs space-y-6">
            {/* Clinical Phenotype */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8C7B6B]" />
                Clinical Health Baseline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="flex justify-between text-[#78716C] mb-1 font-medium">
                    <span>Age:</span>
                    <span className="font-mono text-[#2D2926] font-bold">{age} yrs</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="85"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1 font-medium">
                    <span>Tumor Stage:</span>
                    <span className="font-mono text-[#2D2926] font-bold">
                      {stageIdx === 0 ? 'I' : stageIdx === 1 ? 'II' : stageIdx === 2 ? 'III' : 'IV'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    value={stageIdx}
                    onChange={(e) => setStageIdx(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="text-[10px] text-[#78716C] mt-1">{stages[stageIdx]}</div>
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1 font-medium">
                    <span>Physical Score (Karnofsky):</span>
                    <span className="font-mono text-[#2D2926] font-bold">{karnofsky}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="10"
                    value={karnofsky}
                    onChange={(e) => setKarnofsky(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="text-[10px] text-[#78716C] mt-1">100% = Normal active</div>
                </div>
              </div>
            </div>

            {/* Transcriptomic mRNA Expression */}
            <div className="pt-4 border-t border-[#E6E1D6]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5B7065]" />
                mRNA Gene Expression (Standardized Z-Score)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>MKI67 (Ki-67):</span>
                    <span className="font-mono text-[#2D2926] font-bold">{mki67.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.5"
                    max="3.0"
                    step="0.1"
                    value={mki67}
                    onChange={(e) => setMki67(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#78716C]">Cell division speed</span>
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>TP53 Inactivation:</span>
                    <span className="font-mono text-[#2D2926] font-bold">{tp53.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="3.0"
                    step="0.1"
                    value={tp53}
                    onChange={(e) => setTp53(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#78716C]">Tumor suppressor loss</span>
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>CD8A T-Cells:</span>
                    <span className="font-mono text-[#5B7065] font-bold">{cd8a.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="3.0"
                    step="0.1"
                    value={cd8a}
                    onChange={(e) => setCd8a(Number(e.target.value))}
                    className="w-full accent-[#5B7065] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#5B7065]">Immune defense (protective)</span>
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>PD-L1 (CD274):</span>
                    <span className="font-mono text-[#2D2926] font-bold">{pdl1.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="3.0"
                    step="0.1"
                    value={pdl1}
                    onChange={(e) => setPdl1(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#78716C]">Immune checkpoint flag</span>
                </div>
              </div>
            </div>

            {/* microRNA Regulators */}
            <div className="pt-4 border-t border-[#E6E1D6]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7C6578]" />
                microRNA Regulatory Dials
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>miR-21 (Adverse OncomiR):</span>
                    <span className="font-mono text-[#2D2926] font-bold">{mir21.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="9.0"
                    max="17.0"
                    step="0.2"
                    value={mir21}
                    onChange={(e) => setMir21(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#78716C]">Accelerates cell invasion</span>
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>miR-34a (Protective Suppressor):</span>
                    <span className="font-mono text-[#5B7065] font-bold">{mir34a.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="14.0"
                    step="0.2"
                    value={mir34a}
                    onChange={(e) => setMir34a(Number(e.target.value))}
                    className="w-full accent-[#5B7065] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#5B7065]">Stops damaged cells from dividing</span>
                </div>
              </div>
            </div>

            {/* DNA Methylation & Pathology */}
            <div className="pt-4 border-t border-[#E6E1D6]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A6634B]" />
                DNA Methylation Locks & Tumor Tissue
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>MGMT Methylation:</span>
                    <span className="font-mono text-[#5B7065] font-bold">{(mgmtMeth * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.05"
                    value={mgmtMeth}
                    onChange={(e) => setMgmtMeth(Number(e.target.value))}
                    className="w-full accent-[#5B7065] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#5B7065]">Chemo sensitivity lock</span>
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>CDKN2A Methylation:</span>
                    <span className="font-mono text-[#A6634B] font-bold">{(cdkn2aMeth * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.9"
                    step="0.05"
                    value={cdkn2aMeth}
                    onChange={(e) => setCdkn2aMeth(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#A6634B]">Silenced cell cycle brake</span>
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>Tumor Mutational Burden:</span>
                    <span className="font-mono text-[#2D2926] font-bold">{tmb.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="45.0"
                    step="1.0"
                    value={tmb}
                    onChange={(e) => setTmb(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#78716C]">mut/Mb (&gt;10 = high)</span>
                </div>

                <div>
                  <div className="flex justify-between text-[#78716C] mb-1">
                    <span>Tumor-Infiltrating Lymphocytes:</span>
                    <span className="font-mono text-[#5B7065] font-bold">{tilDensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="5"
                    value={tilDensity}
                    onChange={(e) => setTilDensity(Number(e.target.value))}
                    className="w-full accent-[#5B7065] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] text-[#5B7065]">Tissue immune density</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Prognostic Risk Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                  Multimodal Survival Score
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskCategory.color}`}>
                  {riskCategory.label}
                </span>
              </div>

              {/* Risk Multiplier Callout */}
              <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E6E1D6]">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#78716C] font-medium">Relative Hazard Multiplier</span>
                  <span className="text-3xl font-extrabold text-[#2D2926] font-serif">
                    {Math.exp(prediction.totalRiskScore).toFixed(2)}x
                  </span>
                </div>
                <div className="mt-2 text-xs text-[#78716C] leading-relaxed">
                  Compared to the median patient across all TCGA cohorts, this patient has a{' '}
                  <strong>{Math.exp(prediction.totalRiskScore).toFixed(1)}x</strong> instantaneous rate of disease progression.
                </div>
              </div>

              {/* Survival Probability Milestone Meters */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block">
                  Predicted Survival Chances Over Time
                </span>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#2D2926] font-medium">1-Year Milestone:</span>
                      <span className="font-mono text-[#2D2926] font-bold">
                        {(prediction.predicted1YearSurvival * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E6E1D6]">
                      <div
                        className="h-full bg-[#5B7065] rounded-full transition-all duration-300"
                        style={{ width: `${prediction.predicted1YearSurvival * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#2D2926] font-medium">3-Year Milestone:</span>
                      <span className="font-mono text-[#2D2926] font-bold">
                        {(prediction.predicted3YearSurvival * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E6E1D6]">
                      <div
                        className="h-full bg-[#8C7B6B] rounded-full transition-all duration-300"
                        style={{ width: `${prediction.predicted3YearSurvival * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[#2D2926] font-medium">5-Year Milestone:</span>
                      <span className="font-mono text-[#2D2926] font-bold">
                        {(prediction.predicted5YearSurvival * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E6E1D6]">
                      <div
                        className="h-full bg-[#A6634B] rounded-full transition-all duration-300"
                        style={{ width: `${prediction.predicted5YearSurvival * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modality Contribution Waterfall */}
              <div className="pt-3 border-t border-[#E6E1D6]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] block mb-2">
                  Modality Hazard Attribution (Adverse vs Protective)
                </span>

                <div className="space-y-2 text-xs">
                  {Object.entries(prediction.contributions).map(([mod, val]) => {
                    const isProtective = val < 0;
                    const absVal = Math.min(1.5, Math.abs(val));
                    const pct = (absVal / 1.5) * 100;

                    return (
                      <div key={mod} className="flex items-center justify-between gap-3">
                        <span className="capitalize text-[#78716C] w-28 truncate">{mod.replace('_', ' ')}</span>
                        <div className="flex-1 h-2 bg-[#FAF7F2] rounded-full overflow-hidden flex items-center border border-[#E6E1D6]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isProtective ? 'bg-[#5B7065]' : 'bg-[#A6634B]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[11px] w-12 text-right font-semibold ${isProtective ? 'text-[#5B7065]' : 'text-[#A6634B]'}`}>
                          {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Biomarker Actionable Clues */}
            <div className="bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2926] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A6634B]" />
                Actionable Clinical Clues
              </h4>

              <div className="space-y-2 text-xs">
                {tmb > 10 && tilDensity > 30 && (
                  <div className="p-3 rounded-xl bg-[#EEF2F0] border border-[#5B7065]/30 text-[#2D2926]">
                    <strong className="text-[#5B7065] block mb-0.5">High Immunotherapy Sensitivity:</strong>
                    Elevated mutation burden ({tmb} mut/Mb) with active immune cell infiltration ({tilDensity}%) suggests favorable response to checkpoint inhibitors.
                  </div>
                )}

                {hrdScore > 42 && (
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] text-[#2D2926]">
                    <strong className="text-[#8C7B6B] block mb-0.5">DNA Repair Deficiency:</strong>
                    HRD score of {hrdScore} indicates homologous recombination repair issues, suggesting potential sensitivity to PARP inhibitors.
                  </div>
                )}

                {mgmtMeth > 0.3 && (
                  <div className="p-3 rounded-xl bg-[#F6EDE9] border border-[#A6634B]/30 text-[#2D2926]">
                    <strong className="text-[#A6634B] block mb-0.5">MGMT Promoter Methylation:</strong>
                    Hypermethylation at {(mgmtMeth * 100).toFixed(0)}% locks DNA repair enzymes, improving efficacy of alkylating chemotherapy.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
