import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { TCGA_PATIENT_COHORT, BENCHMARK_MODELS } from '../data/tcgaData';
import { computeKaplanMeier, computeLogRankTest, KaplanMeierCurve } from '../utils/survival';

interface KaplanMeierViewProps {
  selectedCohort: string;
}

export const KaplanMeierView: React.FC<KaplanMeierViewProps> = ({ selectedCohort }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('deep_attention_fusion');
  const [cutoffPercentile, setCutoffPercentile] = useState<number>(50); // 50 = Median split
  const [showCI, setShowCI] = useState<boolean>(true);
  const [showCensoredMarks, setShowCensoredMarks] = useState<boolean>(true);

  // Filter cohort patients
  const patients = useMemo(() => {
    if (selectedCohort === 'ALL') return TCGA_PATIENT_COHORT;
    return TCGA_PATIENT_COHORT.filter((p) => p.cancerType === selectedCohort);
  }, [selectedCohort]);

  // Extract times, events, and model risk scores
  const survivalData = useMemo(() => {
    const scores = patients.map((p) => {
      const modelScores = p.modelRiskScores as any;
      return modelScores[selectedModelId] ?? modelScores.deep_attention_fusion ?? 0;
    });

    const sortedScores = [...scores].sort((a, b) => a - b);
    const cutIdx = Math.floor((cutoffPercentile / 100) * sortedScores.length);
    const threshold = sortedScores[Math.max(0, Math.min(sortedScores.length - 1, cutIdx))];

    const lowTimes: number[] = [];
    const lowEvents: number[] = [];
    const highTimes: number[] = [];
    const highEvents: number[] = [];

    patients.forEach((p, idx) => {
      const s = scores[idx];
      if (s >= threshold) {
        highTimes.push(p.survivalMonths);
        highEvents.push(p.event);
      } else {
        lowTimes.push(p.survivalMonths);
        lowEvents.push(p.event);
      }
    });

    const kmHigh = computeKaplanMeier(highTimes, highEvents, 'High Risk Subgroup', '#A6634B');
    const kmLow = computeKaplanMeier(lowTimes, lowEvents, 'Low Risk Subgroup', '#5B7065');
    const logRank = computeLogRankTest(highTimes, highEvents, lowTimes, lowEvents);

    return {
      kmHigh,
      kmLow,
      logRank,
      highCount: highTimes.length,
      lowCount: lowTimes.length,
      threshold,
    };
  }, [patients, selectedModelId, cutoffPercentile]);

  // Timepoints for numbers at risk table
  const timepoints = [0, 12, 24, 36, 48, 60, 72, 84];

  const getAtRiskAtTime = (curve: KaplanMeierCurve, tTarget: number): number => {
    let atRisk = curve.totalPatients;
    for (const pt of curve.points) {
      if (pt.time <= tTarget) {
        atRisk = pt.nAtRisk;
      } else {
        break;
      }
    }
    return atRisk;
  };

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 360;
  const margin = { top: 24, right: 30, bottom: 45, left: 55 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;
  const maxTime = 96; // 8 years

  const scaleX = (t: number) => margin.left + (Math.min(maxTime, t) / maxTime) * plotWidth;
  const scaleY = (s: number) => margin.top + (1 - s) * plotHeight;

  // Build SVG path for step curve
  const buildStepPath = (points: KaplanMeierCurve['points']) => {
    if (points.length === 0) return '';
    let d = `M ${scaleX(0)} ${scaleY(1.0)}`;
    let prevS = 1.0;

    for (let i = 1; i < points.length; i++) {
      const pt = points[i];
      const xPrev = scaleX(pt.time);
      const yPrev = scaleY(prevS);
      const yNew = scaleY(pt.survival);
      d += ` L ${xPrev} ${yPrev} L ${xPrev} ${yNew}`;
      prevS = pt.survival;
    }
    d += ` L ${scaleX(maxTime)} ${scaleY(prevS)}`;
    return d;
  };

  // Build shaded CI polygon
  const buildCIPolygon = (points: KaplanMeierCurve['points']) => {
    if (points.length < 2) return '';
    const upperPoints: { x: number; y: number }[] = [];
    const lowerPoints: { x: number; y: number }[] = [];

    let prevUpper = 1.0;
    let prevLower = 1.0;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const x = scaleX(pt.time);
      if (i > 0) {
        upperPoints.push({ x, y: scaleY(prevUpper) });
        lowerPoints.push({ x, y: scaleY(prevLower) });
      }
      upperPoints.push({ x, y: scaleY(pt.ciUpper) });
      lowerPoints.push({ x, y: scaleY(pt.ciLower) });
      prevUpper = pt.ciUpper;
      prevLower = pt.ciLower;
    }
    upperPoints.push({ x: scaleX(maxTime), y: scaleY(prevUpper) });
    lowerPoints.push({ x: scaleX(maxTime), y: scaleY(prevLower) });

    const pathUpper = upperPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const pathLower = lowerPoints.reverse().map((p) => `L ${p.x} ${p.y}`).join(' ');

    return `${pathUpper} ${pathLower} Z`;
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
              <TrendingDown className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Survival Trajectory Analysis
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2926] tracking-tight">
            Kaplan-Meier Patient Stratification
          </h2>
          <p className="text-xs text-[#78716C] mt-1 max-w-2xl leading-relaxed">
            See how well the chosen model separates patients into distinct survival outlooks over time.
            The greater the distance between the two lines, the better the model detects real prognostic differences.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E6E1D6] p-2 rounded-xl">
          <label htmlFor="km-model-select" className="text-xs text-[#78716C] font-medium pl-1">
            Scoring Model:
          </label>
          <select
            id="km-model-select"
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="bg-white text-xs font-semibold text-[#2D2926] border border-[#E6E1D6] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#A6634B]/30 cursor-pointer shadow-2xs"
          >
            {BENCHMARK_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-white text-[#2D2926]">
                {m.name} (C-idx: {m.cIndex.toFixed(3)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Publication-Grade KM Curve + Numbers at Risk Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E6E1D6]">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 bg-[#5B7065] rounded-full inline-block" />
                <span className="font-medium text-[#2D2926]">
                  Low Risk Subgroup (N={survivalData.lowCount})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 bg-[#A6634B] rounded-full inline-block" />
                <span className="font-medium text-[#2D2926]">
                  High Risk Subgroup (N={survivalData.highCount})
                </span>
              </div>
            </div>

            {/* Display Toggles */}
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#78716C] hover:text-[#2D2926]">
                <input
                  type="checkbox"
                  checked={showCI}
                  onChange={(e) => setShowCI(e.target.checked)}
                  className="rounded border-[#E6E1D6] text-[#A6634B] focus:ring-[#A6634B] bg-[#FAF7F2]"
                />
                <span>95% Confidence Shading</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-[#78716C] hover:text-[#2D2926]">
                <input
                  type="checkbox"
                  checked={showCensoredMarks}
                  onChange={(e) => setShowCensoredMarks(e.target.checked)}
                  className="rounded border-[#E6E1D6] text-[#A6634B] focus:ring-[#A6634B] bg-[#FAF7F2]"
                />
                <span>Censored Patients (+)</span>
              </label>
            </div>
          </div>

          {/* SVG Kaplan-Meier Chart */}
          <div className="relative w-full overflow-hidden bg-[#FAF7F2] rounded-xl border border-[#E6E1D6] p-2">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none font-sans">
              <defs>
                <linearGradient id="lowCIGradientWarm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B7065" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#5B7065" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="highCIGradientWarm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A6634B" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#A6634B" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((s) => (
                <g key={s}>
                  <line
                    x1={margin.left}
                    y1={scaleY(s)}
                    x2={svgWidth - margin.right}
                    y2={scaleY(s)}
                    stroke="#E6E1D6"
                    strokeDasharray={s === 0.5 ? '3 3' : 'none'}
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left - 10}
                    y={scaleY(s) + 4}
                    textAnchor="end"
                    className="text-[10px] fill-[#78716C] font-mono"
                  >
                    {(s * 100).toFixed(0)}%
                  </text>
                </g>
              ))}

              {/* X-Axis Ticks */}
              {[0, 12, 24, 36, 48, 60, 72, 84, 96].map((m) => (
                <g key={m}>
                  <line
                    x1={scaleX(m)}
                    y1={margin.top}
                    x2={scaleX(m)}
                    y2={svgHeight - margin.bottom}
                    stroke="#E6E1D6"
                    strokeWidth="1"
                  />
                  <text
                    x={scaleX(m)}
                    y={svgHeight - margin.bottom + 18}
                    textAnchor="middle"
                    className="text-[10px] fill-[#78716C] font-mono"
                  >
                    {m}m
                  </text>
                </g>
              ))}

              {/* X and Y Axis Titles */}
              <text
                x={margin.left + plotWidth / 2}
                y={svgHeight - 10}
                textAnchor="middle"
                className="text-[11px] fill-[#2D2926] font-semibold"
              >
                Overall Survival Follow-up Time (Months)
              </text>
              <text
                transform={`rotate(-90)`}
                x={-(margin.top + plotHeight / 2)}
                y={18}
                textAnchor="middle"
                className="text-[11px] fill-[#2D2926] font-semibold"
              >
                Survival Probability (%)
              </text>

              {/* Confidence Intervals */}
              {showCI && (
                <>
                  <path d={buildCIPolygon(survivalData.kmLow.points)} fill="url(#lowCIGradientWarm)" />
                  <path d={buildCIPolygon(survivalData.kmHigh.points)} fill="url(#highCIGradientWarm)" />
                </>
              )}

              {/* Step Curves */}
              <path
                d={buildStepPath(survivalData.kmLow.points)}
                fill="none"
                stroke="#5B7065"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={buildStepPath(survivalData.kmHigh.points)}
                fill="none"
                stroke="#A6634B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Censored Tick Marks */}
              {showCensoredMarks && (
                <>
                  {survivalData.kmLow.points.map((pt, i) =>
                    pt.nCensored > 0 ? (
                      <line
                        key={`c-low-${i}`}
                        x1={scaleX(pt.time)}
                        y1={scaleY(pt.survival) - 4}
                        x2={scaleX(pt.time)}
                        y2={scaleY(pt.survival) + 4}
                        stroke="#5B7065"
                        strokeWidth="1.5"
                      />
                    ) : null
                  )}
                  {survivalData.kmHigh.points.map((pt, i) =>
                    pt.nCensored > 0 ? (
                      <line
                        key={`c-high-${i}`}
                        x1={scaleX(pt.time)}
                        y1={scaleY(pt.survival) - 4}
                        x2={scaleX(pt.time)}
                        y2={scaleY(pt.survival) + 4}
                        stroke="#A6634B"
                        strokeWidth="1.5"
                      />
                    ) : null
                  )}
                </>
              )}
            </svg>
          </div>

          {/* Numbers at Risk Publication Table */}
          <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                Number of Patients Monitored Over Time (At Risk)
              </span>
              <span className="text-[10px] text-[#78716C]">
                Numbers decline as patients experience events or reach end of study
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center font-mono text-[11px]">
                <thead>
                  <tr className="text-[#78716C] border-b border-[#E6E1D6]">
                    <th className="text-left font-sans text-xs py-1.5 px-2 font-semibold">Subgroup</th>
                    {timepoints.map((t) => (
                      <th key={t} className="py-1.5 px-2 font-normal">{t} mo</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D6]/60">
                  <tr>
                    <td className="text-left font-sans text-[#5B7065] font-semibold py-2 px-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#5B7065] inline-block" /> Low Risk
                    </td>
                    {timepoints.map((t) => (
                      <td key={t} className="py-2 px-2 text-[#2D2926] font-medium">
                        {getAtRiskAtTime(survivalData.kmLow, t)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-left font-sans text-[#A6634B] font-semibold py-2 px-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#A6634B] inline-block" /> High Risk
                    </td>
                    {timepoints.map((t) => (
                      <td key={t} className="py-2 px-2 text-[#2D2926] font-medium">
                        {getAtRiskAtTime(survivalData.kmHigh, t)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Biostatistical Summary & Plain English Guide (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Statistical Metrics Card */}
          <div className="bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] pb-2 border-b border-[#E6E1D6] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#A6634B]" />
              Separation Statistics
            </h3>

            {/* Hazard Ratio */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6E1D6]">
              <span className="text-[11px] text-[#78716C] block font-medium">Risk Multiplier (Hazard Ratio)</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-[#A6634B] font-serif">
                  {survivalData.logRank.hazardRatio.toFixed(2)}x
                </span>
                <span className="text-xs text-[#78716C] font-mono">
                  (95% CI: {survivalData.logRank.hrCiLower.toFixed(2)} – {survivalData.logRank.hrCiUpper.toFixed(2)})
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-2 leading-relaxed">
                Patients classified as High Risk experience death at <strong>{survivalData.logRank.hazardRatio.toFixed(1)} times</strong> the rate of patients in the Low Risk group at any given time.
              </p>
            </div>

            {/* Log-Rank Test */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E6E1D6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#78716C]">Log-Rank Score (χ²)</span>
                <span className="font-mono text-sm font-bold text-[#2D2926]">
                  {survivalData.logRank.chiSquare.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E6E1D6]">
                <span className="text-xs text-[#78716C]">Statistical Confidence</span>
                <span className="font-mono text-xs font-bold text-[#5B7065]">
                  {survivalData.logRank.pValue < 0.0001 ? 'p < 0.0001 (Highly Significant)' : `p = ${survivalData.logRank.pValue.toFixed(4)}`}
                </span>
              </div>
            </div>

            {/* Median Survival Times */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F5F0E6] p-3 rounded-xl border border-[#5B7065]/30">
                <span className="text-[10px] text-[#5B7065] uppercase font-bold">Low Risk Median</span>
                <div className="text-lg font-bold font-serif text-[#2D2926] mt-1">
                  {survivalData.kmLow.medianSurvival ? `${survivalData.kmLow.medianSurvival} mos` : '> 96 mos'}
                </div>
              </div>
              <div className="bg-[#F6EDE9] p-3 rounded-xl border border-[#A6634B]/30">
                <span className="text-[10px] text-[#A6634B] uppercase font-bold">High Risk Median</span>
                <div className="text-lg font-bold font-serif text-[#2D2926] mt-1">
                  {survivalData.kmHigh.medianSurvival ? `${survivalData.kmHigh.medianSurvival} mos` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Cutoff Sliders */}
          <div className="bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2926]">
                Risk Cutoff Threshold
              </h4>
              <span className="font-mono text-xs text-[#A6634B] bg-[#F6EDE9] px-2 py-0.5 rounded border border-[#A6634B]/30 font-semibold">
                {cutoffPercentile}th Percentile
              </span>
            </div>

            <div>
              <input
                type="range"
                min="15"
                max="85"
                step="5"
                value={cutoffPercentile}
                onChange={(e) => setCutoffPercentile(Number(e.target.value))}
                className="w-full accent-[#A6634B] bg-[#E6E1D6] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#78716C] mt-1.5">
                <span>Top 85% (Broader)</span>
                <span>Median (50%)</span>
                <span>Top 15% (Ultra-High)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => setCutoffPercentile(50)}
                className={`py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                  cutoffPercentile === 50
                    ? 'bg-[#A6634B] text-white border-[#A6634B]'
                    : 'bg-[#FAF7F2] text-[#78716C] border-[#E6E1D6] hover:text-[#2D2926]'
                }`}
              >
                Median (50/50)
              </button>
              <button
                onClick={() => setCutoffPercentile(33)}
                className={`py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                  cutoffPercentile === 33
                    ? 'bg-[#A6634B] text-white border-[#A6634B]'
                    : 'bg-[#FAF7F2] text-[#78716C] border-[#E6E1D6] hover:text-[#2D2926]'
                }`}
              >
                Tertile Split
              </button>
              <button
                onClick={() => setCutoffPercentile(65)}
                className={`py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                  cutoffPercentile === 65
                    ? 'bg-[#A6634B] text-white border-[#A6634B]'
                    : 'bg-[#FAF7F2] text-[#78716C] border-[#E6E1D6] hover:text-[#2D2926]'
                }`}
              >
                Top 35% Risk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
