import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Trophy,
  Activity,
  Zap,
  BarChart2,
  ShieldCheck,
  TrendingUp,
  Sliders,
  HelpCircle,
  GitCompare,
} from 'lucide-react';

export interface SurvivalModelSpec {
  id: string;
  name: string;
  family: 'Linear Statistical' | 'Deep Learning' | 'Tree Ensemble' | 'Kernel Method' | 'Gradient Boosting';
  cIndex: number;
  brierScore: number; // lower is better
  auc1Year: number;
  auc3Year: number;
  auc5Year: number;
  trainingTime: string;
  missingDataHandling: 'Robust' | 'Moderate' | 'Requires Imputation';
  nonLinearCapture: 'Yes (High)' | 'Yes (Moderate)' | 'Linear Only';
  interpretability: 'Direct Coefficients' | 'Attention Attribution' | 'Tree Surrogates' | 'Feature Weights';
  summaryPlain: string;
  whenToUse: string;
  badgeColor: string;
}

export const SURVIVAL_MODELS_CATALOG: SurvivalModelSpec[] = [
  {
    id: 'cox_ph',
    name: 'Cox Proportional Hazards',
    family: 'Linear Statistical',
    cIndex: 0.634,
    brierScore: 0.214,
    auc1Year: 0.682,
    auc3Year: 0.648,
    auc5Year: 0.621,
    trainingTime: '< 0.1s (Instant)',
    missingDataHandling: 'Requires Imputation',
    nonLinearCapture: 'Linear Only',
    interpretability: 'Direct Coefficients',
    summaryPlain: 'The historic clinical benchmark. Easy to read, but assumes each risk factor adds up linearly without cross-talk.',
    whenToUse: 'When clinicians require standard risk tables with familiar Hazard Ratios and zero black-box risk.',
    badgeColor: 'border-[#E6E1D6] text-[#78716C] bg-[#FAF7F2]',
  },
  {
    id: 'deepsurv',
    name: 'DeepSurv (Intermediate Neural Fusion)',
    family: 'Deep Learning',
    cIndex: 0.785,
    brierScore: 0.138,
    auc1Year: 0.846,
    auc3Year: 0.806,
    auc5Year: 0.781,
    trainingTime: '~4.2s (GPU/CPU)',
    missingDataHandling: 'Robust',
    nonLinearCapture: 'Yes (High)',
    interpretability: 'Attention Attribution',
    summaryPlain: 'Deep neural networks with separate encoders for genes, microRNAs, and clinical tests, merging at a central bottleneck.',
    whenToUse: 'Top recommendation for multimodal cancer data when complex gene-epigenetic interactions drive survival.',
    badgeColor: 'border-[#A6634B]/40 text-[#A6634B] bg-[#F6EDE9]',
  },
  {
    id: 'random_survival_forest',
    name: 'Random Survival Forest (RSF)',
    family: 'Tree Ensemble',
    cIndex: 0.752,
    brierScore: 0.156,
    auc1Year: 0.804,
    auc3Year: 0.768,
    auc5Year: 0.742,
    trainingTime: '~2.8s',
    missingDataHandling: 'Robust',
    nonLinearCapture: 'Yes (Moderate)',
    interpretability: 'Tree Surrogates',
    summaryPlain: 'Builds hundreds of survival decision trees using log-rank splitting rules, averaging out noise.',
    whenToUse: 'When you have moderate sample sizes and want strong resistance to outliers without neural network tuning.',
    badgeColor: 'border-[#5B7065]/40 text-[#5B7065] bg-[#EEF2F0]',
  },
  {
    id: 'gradient_boosting_survival',
    name: 'Gradient Boosting Survival (CoxBoost)',
    family: 'Gradient Boosting',
    cIndex: 0.746,
    brierScore: 0.160,
    auc1Year: 0.795,
    auc3Year: 0.761,
    auc5Year: 0.735,
    trainingTime: '~1.9s',
    missingDataHandling: 'Moderate',
    nonLinearCapture: 'Yes (Moderate)',
    interpretability: 'Feature Weights',
    summaryPlain: 'Iteratively corrects residual survival errors from earlier weak models, creating sharp decision thresholds.',
    whenToUse: 'Effective when specific cutoff thresholds (e.g. TMB > 10 or Age > 65) define dramatic survival shifts.',
    badgeColor: 'border-[#7C6578]/40 text-[#7C6578] bg-[#FAF5F8]',
  },
  {
    id: 'mkl_survival',
    name: 'Multiple Kernel Learning (MKL)',
    family: 'Kernel Method',
    cIndex: 0.768,
    brierScore: 0.149,
    auc1Year: 0.824,
    auc3Year: 0.786,
    auc5Year: 0.758,
    trainingTime: '~3.4s',
    missingDataHandling: 'Moderate',
    nonLinearCapture: 'Yes (Moderate)',
    interpretability: 'Direct Coefficients',
    summaryPlain: 'Builds a patient similarity map for each data type (DNA, RNA, Clinical) and calculates the optimal blend.',
    whenToUse: 'Great mathematical guarantees for high-dimensional omics where patient-to-patient distance matters most.',
    badgeColor: 'border-[#8C7B6B]/40 text-[#8C7B6B] bg-[#F5F0E6]',
  },
];

export const ModelComparisonView: React.FC = () => {
  // Allow picking 2 or 3 models for side-by-side view
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([
    'cox_ph',
    'deepsurv',
    'random_survival_forest',
  ]);

  const toggleModelSelection = (id: string) => {
    if (selectedModelIds.includes(id)) {
      if (selectedModelIds.length > 1) {
        setSelectedModelIds(selectedModelIds.filter((m) => m !== id));
      }
    } else {
      if (selectedModelIds.length < 3) {
        setSelectedModelIds([...selectedModelIds, id]);
      } else {
        // Replace oldest selection
        setSelectedModelIds([selectedModelIds[1], selectedModelIds[2], id]);
      }
    }
  };

  const activeModels = SURVIVAL_MODELS_CATALOG.filter((m) => selectedModelIds.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
                <GitCompare className="w-4 h-4" />
              </span>
              <h2 className="font-serif text-xl font-bold text-[#2D2926]">
                Side-by-Side Survival Model Comparison
              </h2>
            </div>
            <p className="text-xs text-[#78716C] max-w-2xl">
              Compare classic statistical regression against modern deep neural networks and tree ensembles.
              Select up to 3 models below to inspect their C-index accuracy, probability calibration, and clinical trade-offs.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#78716C]">
            <span>Comparing:</span>
            <span className="px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#E6E1D6] font-mono text-[#2D2926] font-semibold">
              {activeModels.length} models selected
            </span>
          </div>
        </div>

        {/* Model Selection Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6E1D6]">
          {SURVIVAL_MODELS_CATALOG.map((model) => {
            const isSelected = selectedModelIds.includes(model.id);
            return (
              <button
                key={model.id}
                onClick={() => toggleModelSelection(model.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-[#FAF7F2] border-[#A6634B] text-[#A6634B] shadow-xs ring-1 ring-[#A6634B]/30'
                    : 'bg-white border-[#E6E1D6] text-[#78716C] hover:text-[#2D2926] hover:bg-[#FAF7F2]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-[#A6634B]' : 'bg-[#D9D2C5]'
                  }`}
                />
                <span>{model.name}</span>
                <span className="font-mono text-[10px] text-[#78716C]">
                  (C: {model.cIndex.toFixed(3)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Cards Comparison */}
      <div className={`grid grid-cols-1 ${activeModels.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 items-stretch`}>
        {activeModels.map((model) => {
          const isTop = model.cIndex === 0.785;
          const cIndexPct = Math.min(100, Math.max(0, ((model.cIndex - 0.5) / 0.5) * 100));

          return (
            <div
              key={model.id}
              className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                isTop
                  ? 'border-[#A6634B] ring-1 ring-[#A6634B]/20'
                  : 'border-[#E6E1D6]'
              }`}
            >
              <div className="space-y-4">
                {/* Model Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E6E1D6]">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {isTop && (
                        <span title="Highest C-Index Accuracy" className="text-[#A6634B]">
                          <Trophy className="w-4 h-4 inline" />
                        </span>
                      )}
                      <h3 className="font-serif text-lg font-bold text-[#2D2926]">{model.name}</h3>
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] block mt-0.5">
                      {model.family}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${model.badgeColor}`}>
                    {isTop ? '★ Top Performer' : model.family}
                  </span>
                </div>

                {/* Primary Metrics: C-index & Brier score */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E6E1D6]">
                    <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1">
                      <span>C-Index Score</span>
                      <span className="text-[10px] font-mono text-[#5B7065]">0.5–1.0</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#2D2926]">
                      {model.cIndex.toFixed(3)}
                    </div>
                    <div className="w-full h-1.5 bg-[#E6E1D6] rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isTop ? 'bg-[#A6634B]' : 'bg-[#5B7065]'
                        }`}
                        style={{ width: `${cIndexPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#78716C] block mt-1">
                      Ranking Accuracy
                    </span>
                  </div>

                  <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E6E1D6]">
                    <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1">
                      <span>Brier Score</span>
                      <span className="text-[10px] font-mono text-[#78716C]">Lower = Better</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#2D2926]">
                      {model.brierScore.toFixed(3)}
                    </div>
                    <div className="w-full h-1.5 bg-[#E6E1D6] rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#8C7B6B] rounded-full"
                        style={{ width: `${(1 - model.brierScore * 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#78716C] block mt-1">
                      Calibration Quality
                    </span>
                  </div>
                </div>

                {/* Milestone Predictions AUC */}
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6E1D6] space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] block font-semibold">
                    Milestone Accuracy (Dynamic AUC)
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#78716C]">1-Year Survival AUC:</span>
                    <span className="font-mono font-bold text-[#2D2926]">{model.auc1Year.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#78716C]">3-Year Survival AUC:</span>
                    <span className="font-mono font-bold text-[#2D2926]">{model.auc3Year.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#78716C]">5-Year Survival AUC:</span>
                    <span className="font-mono font-bold text-[#2D2926]">{model.auc5Year.toFixed(3)}</span>
                  </div>
                </div>

                {/* Plain-English summary */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-mono text-[#78716C] block font-semibold">
                    How it Works in Plain English:
                  </span>
                  <p className="text-[#2D2926] leading-relaxed text-xs">
                    {model.summaryPlain}
                  </p>
                </div>

                {/* Structural Attributes Table */}
                <div className="space-y-2 text-xs pt-2 border-t border-[#E6E1D6]">
                  <div className="flex justify-between py-1 border-b border-[#FAF7F2]">
                    <span className="text-[#78716C]">Biological Interactions:</span>
                    <span className="font-semibold text-[#2D2926]">{model.nonLinearCapture}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF7F2]">
                    <span className="text-[#78716C]">Missing Data Tolerance:</span>
                    <span className="font-semibold text-[#2D2926]">{model.missingDataHandling}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF7F2]">
                    <span className="text-[#78716C]">Interpretability Style:</span>
                    <span className="font-semibold text-[#2D2926]">{model.interpretability}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#78716C]">Compute Time:</span>
                    <span className="font-mono text-[#2D2926]">{model.trainingTime}</span>
                  </div>
                </div>
              </div>

              {/* Best Used When */}
              <div className="mt-4 pt-3 border-t border-[#E6E1D6] text-xs">
                <span className="text-[10px] uppercase font-mono text-[#A6634B] block font-bold mb-0.5">
                  Best Used When:
                </span>
                <p className="text-[#78716C] text-[11px] leading-relaxed">
                  {model.whenToUse}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
