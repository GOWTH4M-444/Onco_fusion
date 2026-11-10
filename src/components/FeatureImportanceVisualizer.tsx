import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Sliders,
  Filter,
  TrendingUp,
  TrendingDown,
  Info,
  Dna,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import {
  rankFeatures,
  TCGA_FEATURE_IMPORTANCES,
  FeatureImportanceItem,
  FeatureModality,
} from '../utils/featureImportance';
import { CANCER_COHORTS } from '../data/tcgaData';

interface FeatureImportanceVisualizerProps {
  selectedCohort: string;
}

export const FeatureImportanceVisualizer: React.FC<FeatureImportanceVisualizerProps> = ({
  selectedCohort,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('deep_attention_fusion');
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<'absolute' | 'adverse' | 'protective'>('absolute');
  const [inspectedFeature, setInspectedFeature] = useState<FeatureImportanceItem | null>(null);

  const cohortMeta = CANCER_COHORTS[selectedCohort] || CANCER_COHORTS.ALL;

  const rankedFeatures = useMemo(() => {
    return rankFeatures(selectedCohort, modalityFilter, selectedModel, sortMode);
  }, [selectedCohort, modalityFilter, selectedModel, sortMode]);

  // Aggregate modality attribution weights
  const modalityShares = useMemo(() => {
    const totals: Record<string, number> = {
      mRNA: 0,
      Clinical: 0,
      'DNA Methylation': 0,
      microRNA: 0,
      Pathology: 0,
      Genomics: 0,
    };

    TCGA_FEATURE_IMPORTANCES.forEach((f) => {
      const scores = f.importanceScores as any;
      const score = scores[selectedModel] ?? scores.deep_attention_fusion ?? 0;
      totals[f.modality] = (totals[f.modality] || 0) + score;
    });

    const sumTotal = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(totals).map(([modality, val]) => ({
      modality,
      percentage: Math.round((val / sumTotal) * 100),
    }));
  }, [selectedModel]);

  const modalityBadgeColors: Record<string, string> = {
    mRNA: 'bg-[#EEF2F0] text-[#5B7065] border-[#5B7065]/30',
    Clinical: 'bg-[#FAF7F2] text-[#8C7B6B] border-[#8C7B6B]/30',
    'DNA Methylation': 'bg-[#F6EDE9] text-[#A6634B] border-[#A6634B]/30',
    microRNA: 'bg-[#F5EFF4] text-[#7C6578] border-[#7C6578]/30',
    Pathology: 'bg-[#FAF7F2] text-[#2D2926] border-[#E6E1D6]',
    Genomics: 'bg-[#FDF8EE] text-[#9E7238] border-[#9E7238]/30',
  };

  const modalityBarColors: Record<string, string> = {
    mRNA: 'bg-[#5B7065]',
    Clinical: 'bg-[#8C7B6B]',
    'DNA Methylation': 'bg-[#A6634B]',
    microRNA: 'bg-[#7C6578]',
    Pathology: 'bg-[#4A4541]',
    Genomics: 'bg-[#9E7238]',
  };

  return (
    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6E1D6]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Model Interpretability & Feature Attribution
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#2D2926] tracking-tight">
            Top-Contributing Biomarkers & Risk Factors
          </h3>
          <p className="text-xs text-[#78716C] mt-1 max-w-2xl leading-relaxed">
            Which genes, microRNAs, and clinical tests drive the model&apos;s survival predictions?
            Click any factor to reveal its biological function and clinical actionability.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E6E1D6] p-2 rounded-xl">
          <label htmlFor="feature-model-select" className="text-xs text-[#78716C] font-medium pl-1">
            Attribution Model:
          </label>
          <select
            id="feature-model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white text-xs font-semibold text-[#2D2926] border border-[#E6E1D6] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#A6634B]/30 cursor-pointer shadow-2xs"
          >
            <option value="deep_attention_fusion">Intermediate Neural Fusion</option>
            <option value="cox_elastic_net">Lasso/Elastic-Net Cox PH</option>
            <option value="random_survival_forest">Random Survival Forest</option>
            <option value="gradient_boosting_survival">Gradient Boosting Survival</option>
            <option value="mkl_survival">Multiple Kernel Learning</option>
          </select>
        </div>
      </div>

      {/* Modality Share Progress Bar */}
      <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#2D2926] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#A6634B]" />
            Modality Attribution Share ({selectedModel.replace(/_/g, ' ')})
          </span>
          <span className="text-[#78716C] text-[11px]">Aggregated across all cohort features</span>
        </div>

        {/* Multi-segment bar */}
        <div className="h-3 w-full bg-white rounded-full overflow-hidden flex shadow-2xs border border-[#E6E1D6]">
          {modalityShares.map((item) => (
            <div
              key={item.modality}
              title={`${item.modality}: ${item.percentage}%`}
              style={{ width: `${item.percentage}%` }}
              className={`${modalityBarColors[item.modality] || 'bg-stone-400'} transition-all duration-300`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px]">
          {modalityShares.map((item) => (
            <div key={item.modality} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${modalityBarColors[item.modality] || 'bg-stone-400'}`} />
              <span className="text-[#78716C]">{item.modality}:</span>
              <span className="font-mono font-bold text-[#2D2926]">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-[#FAF7F2] p-3 rounded-xl border border-[#E6E1D6]">
        {/* Modality Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[#78716C] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#A6634B]" /> Modality:
          </span>
          {[
            { id: 'ALL', label: 'All Modalities' },
            { id: 'mRNA', label: 'mRNA Genes' },
            { id: 'microRNA', label: 'microRNA' },
            { id: 'DNA Methylation', label: 'DNA Methylation' },
            { id: 'Clinical', label: 'Clinical' },
            { id: 'Pathology', label: 'Pathology' },
            { id: 'Genomics', label: 'Genomics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setModalityFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                modalityFilter === tab.id
                  ? 'bg-white text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Direction Sort Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#78716C] font-medium mr-1 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Effect:
          </span>
          <button
            onClick={() => setSortMode('absolute')}
            className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
              sortMode === 'absolute'
                ? 'bg-white text-[#2D2926] border border-[#E6E1D6] shadow-2xs font-semibold'
                : 'text-[#78716C] hover:text-[#2D2926]'
            }`}
          >
            All Magnitude
          </button>
          <button
            onClick={() => setSortMode('adverse')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer ${
              sortMode === 'adverse'
                ? 'bg-[#F6EDE9] text-[#A6634B] border border-[#A6634B]/30 font-semibold'
                : 'text-[#78716C] hover:text-[#2D2926]'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-[#A6634B]" />
            Adverse (+Risk)
          </button>
          <button
            onClick={() => setSortMode('protective')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 cursor-pointer ${
              sortMode === 'protective'
                ? 'bg-[#EEF2F0] text-[#5B7065] border border-[#5B7065]/30 font-semibold'
                : 'text-[#78716C] hover:text-[#2D2926]'
            }`}
          >
            <TrendingDown className="w-3 h-3 text-[#5B7065]" />
            Protective (-Risk)
          </button>
        </div>
      </div>

      {/* Feature Importance Rankings List */}
      <div className="space-y-2.5">
        {rankedFeatures.map((feat, idx) => {
          const isAdverse = feat.direction === 'adverse';
          const scores = feat.importanceScores as any;
          const score = scores[selectedModel] ?? scores.deep_attention_fusion ?? 0;
          const maxScore = Math.max(...rankedFeatures.map((f) => (f.importanceScores as any)[selectedModel] ?? 0.1), 0.1);
          const scorePct = Math.min(100, Math.max(8, (score / maxScore) * 100));
          const isSelected = inspectedFeature?.id === feat.id;

          return (
            <div
              key={feat.id}
              onClick={() => setInspectedFeature(isSelected ? null : feat)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FAF7F2] border-[#A6634B]/50 shadow-xs ring-1 ring-[#A6634B]/20'
                  : 'bg-white border-[#E6E1D6] hover:border-[#D6CFBE]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Rank & Name */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <span className="w-6 text-center font-mono font-bold text-xs text-[#78716C]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#2D2926]">
                        {feat.name}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${
                          modalityBadgeColors[feat.modality] || 'bg-[#FAF7F2] text-[#78716C] border-[#E6E1D6]'
                        }`}
                      >
                        {feat.modality}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#78716C] block">{feat.symbol}</span>
                  </div>
                </div>

                {/* Relative Importance Bar */}
                <div className="flex-1 max-w-md flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E6E1D6]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAdverse ? 'bg-[#A6634B]' : 'bg-[#5B7065]'
                      }`}
                      style={{ width: `${scorePct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#2D2926] w-10 text-right">
                    {score.toFixed(2)}
                  </span>
                </div>

                {/* Hazard Ratio Badge */}
                <div className="flex items-center gap-3 justify-between sm:justify-end min-w-[170px]">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[11px] text-[#78716C]">HR:</span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          isAdverse ? 'text-[#A6634B]' : 'text-[#5B7065]'
                        }`}
                      >
                        {feat.hazardRatio.toFixed(2)}x
                      </span>
                      <span className="text-[10px] text-[#78716C] font-mono">
                        ({feat.hrCiLower.toFixed(2)}–{feat.hrCiUpper.toFixed(2)})
                      </span>
                    </div>
                    <span className="text-[10px] text-[#78716C] block">
                      p={feat.pValue < 0.001 ? '<0.001' : feat.pValue.toFixed(4)}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                      isAdverse
                        ? 'bg-[#F6EDE9] text-[#A6634B] border border-[#A6634B]/30'
                        : 'bg-[#EEF2F0] text-[#5B7065] border border-[#5B7065]/30'
                    }`}
                  >
                    {isAdverse ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-[#A6634B]" /> Adverse
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-[#5B7065]" /> Favorable
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Expandable Detail Panel */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-[#E6E1D6] text-xs space-y-2 bg-[#FAF7F2] p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#A6634B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2D2926]">Biological Mechanism & Actionability:</strong>{' '}
                      <span className="text-[#78716C]">{feat.biologicalFunction}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#78716C] pt-1">
                    <span>
                      High-Affinity Cohorts:{' '}
                      <strong className="text-[#2D2926] font-mono">{feat.cohortAffinity.join(', ')}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Risk Effect Direction:{' '}
                      <strong className={isAdverse ? 'text-[#A6634B]' : 'text-[#5B7065]'}>
                        {isAdverse ? 'Higher expression increases instantaneous hazard of death' : 'Higher expression confers survival advantage'}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
