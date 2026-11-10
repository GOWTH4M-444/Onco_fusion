import React, { useState } from 'react';
import {
  Trophy,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  BarChart3,
  GitCompare,
} from 'lucide-react';
import { BENCHMARK_MODELS, CANCER_COHORTS, ModelBenchmarkMeta } from '../data/tcgaData';
import { FeatureImportanceVisualizer } from './FeatureImportanceVisualizer';

interface BenchmarkViewProps {
  selectedCohort: string;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({ selectedCohort }) => {
  const [benchmarkSection, setBenchmarkSection] = useState<'both' | 'leaderboard' | 'features'>('both');
  const [filterParadigm, setFilterParadigm] = useState<string>('ALL');
  const cohortMeta = CANCER_COHORTS[selectedCohort] || CANCER_COHORTS.ALL;

  const filteredModels = BENCHMARK_MODELS.filter((m) => {
    if (filterParadigm === 'ALL') return true;
    if (filterParadigm === 'BASELINES') return m.paradigm === 'Single-Modality Baseline';
    if (filterParadigm === 'FUSION') return m.paradigm !== 'Single-Modality Baseline';
    return true;
  });

  const clinicalModel = BENCHMARK_MODELS.find((m) => m.id === 'clinical_only')!;
  const topModel = BENCHMARK_MODELS.reduce((best, cur) => (cur.cIndex > best.cIndex ? cur : best), BENCHMARK_MODELS[0]);
  const cIndexGain = topModel.cIndex - clinicalModel.cIndex;

  return (
    <div className="space-y-6">
      {/* Top Banner & Insight */}
      <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F6EDE9] text-[#A6634B] border border-[#A6634B]/30">
                Pan-Cancer Benchmark
              </span>
              <span className="text-xs text-[#78716C]">
                Cohort: <strong className="text-[#2D2926] font-medium">{cohortMeta.code} ({cohortMeta.name})</strong>
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2D2926] tracking-tight">
              Multimodal Data Fusion vs. Single-Modality Baselines
            </h2>
            <p className="text-xs text-[#78716C] mt-1.5 max-w-3xl leading-relaxed">
              Does combining clinical staging with mRNA gene expression, microRNA dials, and DNA methylation locks produce more accurate survival predictions than standard clinical tests alone?
              Evaluated across 10 architectures using Harrell&apos;s C-index (ranking accuracy) and milestone AUCs.
            </p>
          </div>

          {/* Metric Highlight Card */}
          <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-4 min-w-[260px] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#78716C] mb-1">
              <span>Overall Accuracy Gain</span>
              <span className="text-[#5B7065] font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +{(cIndexGain * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2D2926] font-serif">{topModel.cIndex.toFixed(3)}</span>
              <span className="text-xs text-[#78716C]">vs 0.634 (Clinical)</span>
            </div>
            <div className="mt-2 text-[11px] text-[#78716C] border-t border-[#E6E1D6] pt-2">
              Top performer: <strong className="text-[#2D2926]">{topModel.name}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Sub-Section Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E6E1D6] p-2.5 rounded-xl text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-[#78716C] font-semibold px-2">Views:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setBenchmarkSection('both')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                benchmarkSection === 'both'
                  ? 'bg-[#FAF7F2] text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              Overview & Full Analysis
            </button>
            <button
              onClick={() => setBenchmarkSection('leaderboard')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                benchmarkSection === 'leaderboard'
                  ? 'bg-[#FAF7F2] text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#A6634B]" />
              <span>Model Leaderboard</span>
            </button>
            <button
              onClick={() => setBenchmarkSection('features')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                benchmarkSection === 'features'
                  ? 'bg-[#FAF7F2] text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#5B7065]" />
              <span>Feature Importance Rankings</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#78716C] hidden sm:block">
          Active Cohort: <strong className="text-[#2D2926] font-mono">{cohortMeta.code}</strong>
        </div>
      </div>

      {/* Model Performance Leaderboard Section */}
      {benchmarkSection !== 'features' && (
        <div className="space-y-4">
          {/* Filter Tabs & Paradigm Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-[#E6E1D6]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#78716C]" />
              <span className="text-xs font-semibold text-[#2D2926]">Filter Architectures:</span>
              <div className="flex gap-1.5 ml-2">
                {[
                  { id: 'ALL', label: 'All 10 Models' },
                  { id: 'FUSION', label: 'Multimodal Fusion Only' },
                  { id: 'BASELINES', label: 'Single-Modality Baselines' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterParadigm(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      filterParadigm === f.id
                        ? 'bg-[#FAF7F2] text-[#A6634B] border border-[#E6E1D6] font-semibold'
                        : 'text-[#78716C] hover:text-[#2D2926]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#78716C]">
              Showing <span className="font-semibold text-[#2D2926]">{filteredModels.length}</span> models
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white border border-[#E6E1D6] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#78716C] uppercase tracking-wider text-[11px] border-b border-[#E6E1D6]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Model & Architecture</th>
                    <th className="py-3.5 px-3 font-semibold">Paradigm</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Ranking Accuracy (C-Index)</th>
                    <th className="py-3.5 px-3 font-semibold text-center">1-Yr AUC</th>
                    <th className="py-3.5 px-3 font-semibold text-center">3-Yr AUC</th>
                    <th className="py-3.5 px-3 font-semibold text-center">5-Yr AUC</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Brier Score</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Risk Multiplier (HR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D6]/60">
                  {filteredModels.map((m) => {
                    const isTop = m.id === topModel.id;
                    const isClinical = m.id === 'clinical_only';
                    const cIndexPct = Math.min(100, Math.max(0, ((m.cIndex - 0.5) / 0.5) * 100));

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-[#FAF7F2] transition-colors ${
                          isTop ? 'bg-[#F6EDE9]/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isTop && (
                              <span title="Top Performing Model" className="p-1 rounded-md bg-[#F6EDE9] text-[#A6634B]">
                                <Trophy className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <div>
                              <span className={`font-semibold text-sm ${isTop ? 'text-[#A6634B] font-bold' : 'text-[#2D2926]'}`}>
                                {m.name}
                              </span>
                              <p className="text-[11px] text-[#78716C] max-w-md line-clamp-1">{m.description}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium border border-[#E6E1D6] bg-[#FAF7F2] text-[#78716C]">
                            {m.paradigm}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`font-mono text-sm font-bold ${isTop ? 'text-[#A6634B]' : 'text-[#2D2926]'}`}>
                              {m.cIndex.toFixed(3)}
                            </span>
                            <div className="w-16 h-1.5 bg-[#E6E1D6] rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isTop ? 'bg-[#A6634B]' : isClinical ? 'bg-[#78716C]' : 'bg-[#5B7065]'
                                }`}
                                style={{ width: `${cIndexPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-[#2D2926]">
                          {m.auc1Year.toFixed(3)}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-[#2D2926]">
                          {m.auc3Year.toFixed(3)}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-[#2D2926]">
                          {m.auc5Year.toFixed(3)}
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-[#78716C]">
                          {m.integratedBrierScore.toFixed(3)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-semibold text-[#A6634B]">
                            {m.hazardRatio.toFixed(2)}x
                          </span>
                          <span className="block text-[10px] text-[#78716C]">
                            p={m.logRankPValue < 0.001 ? '<0.001' : m.logRankPValue.toFixed(4)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance Rankings Visualization Section */}
      {benchmarkSection !== 'leaderboard' && (
        <FeatureImportanceVisualizer selectedCohort={selectedCohort} />
      )}

      {/* Comparative Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-[#FAF7F2] text-[#8C7B6B] border border-[#E6E1D6]">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-[#2D2926] text-sm">Clinical Baseline Limit</h3>
          </div>
          <p className="text-xs text-[#78716C] leading-relaxed">
            Standard clinical factors (Age, Stage, Karnofsky performance) achieve a C-index of <strong>0.634</strong>. While vital for macro staging, clinical data alone cannot detect sub-visual gene mutations, DNA repair deficiencies (HRD), or immune checkpoint engagement.
          </p>
        </div>

        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-[#EEF2F0] text-[#5B7065] border border-[#5B7065]/30">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-[#2D2926] text-sm">Early vs. Intermediate Fusion</h3>
          </div>
          <p className="text-xs text-[#78716C] leading-relaxed">
            Concatenating all raw features together (Early Fusion) attains <strong>0.732</strong>. In contrast, intermediate fusion with dedicated modality encoders achieves <strong>0.785</strong>, preventing 20,000 gene columns from drowning out clinical staging.
          </p>
        </div>

        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-[#F6EDE9] text-[#A6634B] border border-[#A6634B]/30">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-[#2D2926] text-sm">Bioinformatics Benchmark</h3>
          </div>
          <p className="text-xs text-[#78716C] leading-relaxed">
            Consistent with the peer-reviewed pan-cancer benchmark in <em>Bioinformatics (Oxford)</em>, multimodal fusion demonstrates significant predictive superiority (C-index ~0.78) across primary tumor sites.
          </p>
        </div>
      </div>
    </div>
  );
};
