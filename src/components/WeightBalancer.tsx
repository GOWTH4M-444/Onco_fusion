import React, { useState, useMemo } from 'react';
import { Sliders, Sparkles, TrendingUp, Info, RotateCcw } from 'lucide-react';

interface ModalityWeight {
  id: string;
  name: string;
  plainRole: string;
  weight: number; // 0 to 100
  colorHex: string;
}

export const WeightBalancer: React.FC = () => {
  const [weights, setWeights] = useState<Record<string, number>>({
    clinical: 20,
    mrna: 35,
    mirna: 15,
    methylation: 20,
    pathology: 10,
  });

  const updateWeight = (key: string, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  const resetBalanced = () => {
    setWeights({
      clinical: 20,
      mrna: 35,
      mirna: 15,
      methylation: 20,
      pathology: 10,
    });
  };

  // Dynamic C-index simulation based on weights
  const { simulatedCIndex, normalizedShares, plainInsight } = useMemo(() => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    const nClinical = (weights.clinical || 0) / total;
    const nMrna = (weights.mrna || 0) / total;
    const nMirna = (weights.mirna || 0) / total;
    const nMeth = (weights.methylation || 0) / total;
    const nPath = (weights.pathology || 0) / total;

    // Biological interaction synergistic score
    let c = 0.50; // Random guess baseline
    c += nClinical * 0.134; // Clinical alone contributes to 0.634
    c += nMrna * 0.196;     // mRNA brings to 0.696
    c += nMirna * 0.168;
    c += nMeth * 0.175;
    c += nPath * 0.165;

    // Cross-modal synergy bonus when combining disparate omics
    const diversityPenaltyOrBonus =
      (nClinical > 0.05 ? 0.02 : 0) +
      (nMrna > 0.05 && nMeth > 0.05 ? 0.035 : 0) +
      (nPath > 0.05 ? 0.02 : 0);

    const finalC = Math.min(0.792, Math.max(0.55, c + diversityPenaltyOrBonus));

    // Dynamic advice text
    let insight = 'Balanced Multi-Omics Synergy: Combining phenotypic records with genomic and epigenetic marks maximizes predictive power across both short and long horizons.';
    if (nClinical > 0.6) {
      insight = 'Heavy Clinical Bias: Staging and age explain initial risk, but miss occult mutations and targeted immunotherapy response.';
    } else if (nMrna > 0.6) {
      insight = 'Heavy Gene Bias: Excellent for detecting active mitotic speed, but may overlook anatomical tumor size and organ stamina.';
    } else if (nMeth > 0.4) {
      insight = 'Epigenetic Focus: Strongly captures permanent DNA silence (like MGMT or CDKN2A), especially reliable for 5-year outlooks.';
    }

    return {
      simulatedCIndex: Number(finalC.toFixed(3)),
      normalizedShares: {
        clinical: Math.round(nClinical * 100),
        mrna: Math.round(nMrna * 100),
        mirna: Math.round(nMirna * 100),
        methylation: Math.round(nMeth * 100),
        pathology: Math.round(nPath * 100),
      },
      plainInsight: insight,
    };
  }, [weights]);

  return (
    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-lg font-bold text-[#2D2926]">
              Interactive Multi-Omics Weight Balancer
            </h3>
          </div>
          <p className="text-xs text-[#78716C]">
            Adjust the sliders below to balance how much influence each biological layer has on patient survival forecasting.
          </p>
        </div>

        <button
          onClick={resetBalanced}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F5F0E6] text-xs font-medium text-[#2D2926] border border-[#E6E1D6] self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#78716C]" />
          <span>Reset to Optimal Balance</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {[
            {
              id: 'clinical',
              name: 'Clinical Health History',
              plain: 'Age, Cancer Stage, and Overall Stamina',
              color: '#8C7B6B',
              bgClass: 'accent-[#8C7B6B]',
            },
            {
              id: 'mrna',
              name: 'mRNA Gene Transcripts',
              plain: 'Active gene signals (Ki-67, TP53, EGFR)',
              color: '#5B7065',
              bgClass: 'accent-[#5B7065]',
            },
            {
              id: 'mirna',
              name: 'microRNA Regulators',
              plain: 'Post-transcriptional volume switches (miR-21)',
              color: '#7C6578',
              bgClass: 'accent-[#7C6578]',
            },
            {
              id: 'methylation',
              name: 'DNA Methylation',
              plain: 'Epigenetic chemical tags on DNA (MGMT, CDKN2A)',
              color: '#A6634B',
              bgClass: 'accent-[#A6634B]',
            },
            {
              id: 'pathology',
              name: 'Pathology & Cell Images',
              plain: 'Immune cell density (TILs) and tumor tissue texture',
              color: '#3B6B78',
              bgClass: 'accent-[#3B6B78]',
            },
          ].map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-[#2D2926]">{item.name}</span>
                  <span className="text-[11px] text-[#78716C] ml-2 hidden sm:inline">
                    ({item.plain})
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-[#2D2926]">
                  {normalizedShares[item.id as keyof typeof normalizedShares]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights[item.id]}
                onChange={(e) => updateWeight(item.id, Number(e.target.value))}
                className={`w-full bg-[#E6E1D6] h-2 rounded-lg cursor-pointer ${item.bgClass}`}
              />
            </div>
          ))}
        </div>

        {/* Real-time Simulated Metric Dial (5 cols) */}
        <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-5 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[#78716C] block">
              Estimated Ranking Accuracy
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-serif text-4xl font-extrabold text-[#A6634B]">
                {simulatedCIndex.toFixed(3)}
              </span>
              <span className="text-xs text-[#78716C] font-mono">C-Index</span>
            </div>
            <span className="text-xs font-medium text-[#5B7065] flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{((simulatedCIndex - 0.634) * 100).toFixed(1)}% vs. Clinical Alone</span>
            </span>
          </div>

          {/* Proportional Segment Bar */}
          <div className="space-y-1.5 pt-2 border-t border-[#E6E1D6]">
            <span className="text-[10px] uppercase font-mono text-[#78716C] block font-semibold">
              Current Modality Blend:
            </span>
            <div className="w-full h-3 bg-[#E6E1D6] rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${normalizedShares.clinical}%`, backgroundColor: '#8C7B6B' }}
                title={`Clinical: ${normalizedShares.clinical}%`}
              />
              <div
                style={{ width: `${normalizedShares.mrna}%`, backgroundColor: '#5B7065' }}
                title={`mRNA: ${normalizedShares.mrna}%`}
              />
              <div
                style={{ width: `${normalizedShares.mirna}%`, backgroundColor: '#7C6578' }}
                title={`microRNA: ${normalizedShares.mirna}%`}
              />
              <div
                style={{ width: `${normalizedShares.methylation}%`, backgroundColor: '#A6634B' }}
                title={`Methylation: ${normalizedShares.methylation}%`}
              />
              <div
                style={{ width: `${normalizedShares.pathology}%`, backgroundColor: '#3B6B78' }}
                title={`Pathology: ${normalizedShares.pathology}%`}
              />
            </div>
          </div>

          {/* Plain-English Takeaway */}
          <div className="bg-white p-3 rounded-lg border border-[#E6E1D6] text-xs text-[#78716C] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#A6634B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{plainInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
