import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  GitBranch,
  Gauge,
  TrendingUp,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { AVAILABLE_MODALITIES, ModalityType } from '../utils/fusion';
import { CANCER_COHORTS } from '../data/tcgaData';
import { DataFusionCore3D } from './DataFusionCore3D';
import { WeightBalancer } from './WeightBalancer';

interface FusionEngineViewProps {
  selectedCohort: string;
}

export const FusionEngineView: React.FC<FusionEngineViewProps> = ({ selectedCohort }) => {
  const [activeSubTab, setActiveSubTab] = useState<'3d_core' | 'balancer' | 'hyperparams'>('3d_core');
  const [activeModalities, setActiveModalities] = useState<Record<ModalityType, boolean>>({
    clinical: true,
    mrna: true,
    mirna: true,
    methylation: true,
    cnv_mutation: true,
    pathology: true,
  });

  const [fusionArchitecture, setFusionArchitecture] = useState<'intermediate' | 'early' | 'mkl' | 'bayesian'>('intermediate');
  const [epochs, setEpochs] = useState<number>(35);
  const [pcaComponents, setPcaComponents] = useState<number>(5);
  const [applyPca, setApplyPca] = useState<boolean>(true);
  const [l1Ratio, setL1Ratio] = useState<number>(0.2);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [lastResults, setLastResults] = useState<{
    cIndex: number;
    auc1y: number;
    auc3y: number;
    auc5y: number;
    brier: number;
    deltaVsClinical: number;
  } | null>({
    cIndex: 0.785,
    auc1y: 0.846,
    auc3y: 0.806,
    auc5y: 0.781,
    brier: 0.138,
    deltaVsClinical: 0.151,
  });

  const cohortMeta = CANCER_COHORTS[selectedCohort] || CANCER_COHORTS.ALL;

  const toggleModality = (id: ModalityType) => {
    setActiveModalities((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (Object.values(next).filter(Boolean).length === 0) return prev;
      return next;
    });
  };

  const handleRunTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);

    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);

          const activeCount = Object.values(activeModalities).filter(Boolean).length;
          let baseCIndex = 0.634; // clinical alone

          if (fusionArchitecture === 'intermediate') {
            baseCIndex = 0.634 + (activeCount - 1) * 0.030;
            if (activeModalities.mrna) baseCIndex += 0.02;
            if (activeModalities.methylation) baseCIndex += 0.015;
          } else if (fusionArchitecture === 'early') {
            baseCIndex = 0.634 + (activeCount - 1) * 0.020;
          } else if (fusionArchitecture === 'mkl') {
            baseCIndex = 0.634 + (activeCount - 1) * 0.027;
          } else {
            baseCIndex = 0.634 + (activeCount - 1) * 0.028;
          }

          const finalC = Math.min(0.812, Math.max(0.610, baseCIndex + (Math.random() * 0.01 - 0.005)));
          setLastResults({
            cIndex: Number(finalC.toFixed(3)),
            auc1y: Number((finalC + 0.06).toFixed(3)),
            auc3y: Number((finalC + 0.02).toFixed(3)),
            auc5y: Number((finalC - 0.005).toFixed(3)),
            brier: Number((0.22 - (finalC - 0.5) * 0.25).toFixed(3)),
            deltaVsClinical: Number((finalC - 0.634).toFixed(3)),
          });
          return 100;
        }
        return prev + 12;
      });
    }, 120);
  };

  const architectures = [
    {
      id: 'intermediate',
      name: 'Intermediate Neural Fusion',
      subtitle: 'Separate Encoders → Joint Bottleneck',
      desc: 'Each biological modality is first compressed by its own tailored neural network before joining a shared patient risk layer. Prevents noisy genes from overwhelming clinical stages.',
      badge: 'Recommended',
    },
    {
      id: 'early',
      name: 'Early Fusion (Concatenation)',
      subtitle: 'One Giant Combined Matrix',
      desc: 'Glues all clinical, gene, and epigenetic columns side-by-side into a single large table before regression. Simple, but high-dimensional genes can drown out clinical factors.',
      badge: 'Baseline',
    },
    {
      id: 'mkl',
      name: 'Multiple Kernel Learning (MKL)',
      subtitle: 'Weighted Patient Similarity Kernels',
      desc: 'Constructs mathematical similarity matrices for each data type (e.g. genomic similarity + clinical similarity) and learns optimal fusion weights between them.',
      badge: 'Kernel Method',
    },
    {
      id: 'bayesian',
      name: 'Bayesian Multimodal Fusion',
      subtitle: 'Probabilistic Prior Modeling',
      desc: 'Explicitly handles clinical uncertainty, patient missingness, and measurement noise via Bayesian priors, producing confidence bounds around each prediction.',
      badge: 'Probabilistic',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Multimodal Integration
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2926] tracking-tight">
            Multi-Omics Fusion Engine
          </h2>
          <p className="text-xs text-[#78716C] mt-1 max-w-2xl leading-relaxed">
            Configure how Clinical records, mRNA transcripts, microRNA dials, and DNA methylation markers converge to calculate patient risk.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E6E1D6] p-1.5 rounded-xl">
          <button
            onClick={() => setActiveSubTab('3d_core')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === '3d_core'
                ? 'bg-white text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                : 'text-[#78716C] hover:text-[#2D2926]'
            }`}
          >
            3D Convergence Core
          </button>
          <button
            onClick={() => setActiveSubTab('balancer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'balancer'
                ? 'bg-white text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                : 'text-[#78716C] hover:text-[#2D2926]'
            }`}
          >
            Modality Weight Balancer
          </button>
          <button
            onClick={() => setActiveSubTab('hyperparams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'hyperparams'
                ? 'bg-white text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                : 'text-[#78716C] hover:text-[#2D2926]'
            }`}
          >
            Architecture & Pipeline
          </button>
        </div>
      </div>

      {/* Sub-tab 1: 3D Data Fusion Core */}
      {activeSubTab === '3d_core' && (
        <div className="space-y-6">
          <DataFusionCore3D />
          <WeightBalancer />
        </div>
      )}

      {/* Sub-tab 2: Modality Weight Balancer */}
      {activeSubTab === 'balancer' && (
        <div className="space-y-6">
          <WeightBalancer />
          <DataFusionCore3D />
        </div>
      )}

      {/* Sub-tab 3: Architecture & Training Controls */}
      {activeSubTab === 'hyperparams' && (
        <div className="space-y-6">
          {/* Main Fusion Configuration Card */}
          <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs space-y-6">
            {/* 1. Modality Selection Checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#A6634B]" />
                  Active Data Modalities
                </span>
                <span className="text-xs text-[#78716C]">
                  {Object.values(activeModalities).filter(Boolean).length} of 6 active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {AVAILABLE_MODALITIES.map((mod) => {
                  const isActive = activeModalities[mod.id];
                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModality(mod.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FAF7F2] border-[#A6634B]/40 shadow-xs'
                          : 'bg-white border-[#E6E1D6] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2D2926]">{mod.name}</span>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isActive ? 'bg-[#A6634B]' : 'bg-[#E6E1D6]'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-[#78716C] line-clamp-1">{mod.category}</p>
                      <span className="text-[9px] font-mono text-[#5B7065] mt-1 block">
                        {mod.featureCount} features
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Fusion Architecture Choice */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block mb-3">
                Fusion Architecture
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {architectures.map((arch) => {
                  const isSel = fusionArchitecture === arch.id;
                  return (
                    <div
                      key={arch.id}
                      onClick={() => setFusionArchitecture(arch.id as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSel
                          ? 'bg-[#FAF7F2] border-[#A6634B] ring-1 ring-[#A6634B]/30 shadow-xs'
                          : 'bg-white border-[#E6E1D6] hover:border-[#D6CFBE]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-[#2D2926]">{arch.name}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                            isSel ? 'bg-[#F6EDE9] text-[#A6634B]' : 'bg-[#FAF7F2] text-[#78716C]'
                          }`}
                        >
                          {arch.badge}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-[#78716C] mb-1.5">{arch.subtitle}</div>
                      <p className="text-[11px] text-[#78716C] leading-relaxed">{arch.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Hyperparameter Controls */}
            <div className="pt-4 border-t border-[#E6E1D6] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <div className="flex justify-between text-[#2D2926] font-medium mb-1.5">
                  <span>Optimization Epochs:</span>
                  <span className="font-mono text-[#A6634B] font-bold">{epochs}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#2D2926] font-medium mb-1.5">
                  <span>PCA Components per Modality:</span>
                  <span className="font-mono text-[#A6634B] font-bold">
                    {applyPca ? `${pcaComponents} components` : 'Full / No PCA'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="2"
                    max="10"
                    disabled={!applyPca}
                    value={pcaComponents}
                    onChange={(e) => setPcaComponents(Number(e.target.value))}
                    className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <label className="flex items-center gap-1 text-[11px] text-[#78716C] whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={applyPca}
                      onChange={(e) => setApplyPca(e.target.checked)}
                      className="rounded border-[#E6E1D6] text-[#A6634B] bg-[#FAF7F2]"
                    />
                    <span>Enable</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#2D2926] font-medium mb-1.5">
                  <span>Elastic-Net Regularization (α):</span>
                  <span className="font-mono text-[#A6634B] font-bold">{l1Ratio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={l1Ratio}
                  onChange={(e) => setL1Ratio(Number(e.target.value))}
                  className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#78716C] mt-1">
                  <span>0.0 (Ridge / L2)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Lasso / L1)</span>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[#78716C]">
                Ready to retrain model on {cohortMeta.code} cohort
              </span>
              <button
                onClick={handleRunTraining}
                disabled={isTraining}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A6634B] text-white font-medium text-xs hover:bg-[#8E523D] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTraining ? `Fitting Pipeline (${trainingProgress}%)` : 'Run Pipeline Simulation'}</span>
              </button>
            </div>
          </div>

          {/* Model Training Live Results */}
          {lastResults && (
            <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5B7065]" />
                  <h3 className="text-sm font-bold text-[#2D2926]">
                    Evaluation Results on Held-out Test Cohort ({cohortMeta.code})
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#5B7065] bg-[#EEF2F0] px-2.5 py-1 rounded border border-[#5B7065]/30 font-semibold">
                  +{((lastResults.deltaVsClinical) * 100).toFixed(1)}% vs. Clinical Baseline
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#A6634B]/30">
                  <span className="text-[11px] text-[#A6634B] block uppercase font-bold">Harrell&apos;s C-Index</span>
                  <span className="text-2xl font-extrabold text-[#2D2926] font-serif mt-1 block">
                    {lastResults.cIndex.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-[#78716C]">Ranking accuracy</span>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6E1D6]">
                  <span className="text-[11px] text-[#78716C] block uppercase font-semibold">1-Year AUC</span>
                  <span className="text-2xl font-extrabold text-[#2D2926] font-serif mt-1 block">
                    {lastResults.auc1y.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-[#78716C]">Short-term accuracy</span>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6E1D6]">
                  <span className="text-[11px] text-[#78716C] block uppercase font-semibold">3-Year AUC</span>
                  <span className="text-2xl font-extrabold text-[#2D2926] font-serif mt-1 block">
                    {lastResults.auc3y.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-[#78716C]">Mid-term accuracy</span>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6E1D6]">
                  <span className="text-[11px] text-[#78716C] block uppercase font-semibold">5-Year AUC</span>
                  <span className="text-2xl font-extrabold text-[#2D2926] font-serif mt-1 block">
                    {lastResults.auc5y.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-[#78716C]">Long-term accuracy</span>
                </div>

                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6E1D6]">
                  <span className="text-[11px] text-[#78716C] block uppercase font-semibold">Brier Score</span>
                  <span className="text-2xl font-extrabold text-[#2D2926] font-serif mt-1 block">
                    {lastResults.brier.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-[#78716C]">Calibration (lower is better)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
