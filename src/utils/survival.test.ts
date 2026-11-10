import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCIndex,
  computeKaplanMeier,
  computeLogRankTest,
  computeTimeDependentAUC,
  computeBrierScoreAtTime,
} from './survival';

test('Harrell C-Index: returns 1.0 for perfectly ordered non-censored risk scores', () => {
  // Shorter time should correspond to higher risk score
  const times = [10, 20, 30, 40, 50];
  const events = [1, 1, 1, 1, 1];
  const riskScores = [5.0, 4.0, 3.0, 2.0, 1.0];

  const cIndex = calculateCIndex(times, events, riskScores);
  assert.equal(cIndex, 1.0);
});

test('Harrell C-Index: returns 0.0 for perfectly inverted risk scores', () => {
  const times = [10, 20, 30, 40, 50];
  const events = [1, 1, 1, 1, 1];
  const riskScores = [1.0, 2.0, 3.0, 4.0, 5.0];

  const cIndex = calculateCIndex(times, events, riskScores);
  assert.equal(cIndex, 0.0);
});

test('Harrell C-Index: correctly ignores non-informative right-censored pairs', () => {
  // If patient A is censored at t=20, and patient B had event at t=30,
  // A's survival time is >= 20 which could be > 30, so pair is omitted.
  const times = [10, 20, 30];
  const events = [1, 0, 1];
  const riskScores = [3.0, 1.0, 2.0];

  const cIndex = calculateCIndex(times, events, riskScores);
  // Usable pairs:
  // (0, 1): time 10 (event) < time 20 (censored) -> usable. Risk 3 > 1 -> concordant.
  // (0, 2): time 10 (event) < time 30 (event) -> usable. Risk 3 > 2 -> concordant.
  // (1, 2): time 20 (censored) < time 30 (event) -> non-usable!
  // Result = 2/2 = 1.0
  assert.equal(cIndex, 1.0);
});

test('Kaplan-Meier: S(0) equals 1.0 and is monotonically non-increasing', () => {
  const times = [12, 24, 36, 48, 60, 72];
  const events = [1, 1, 0, 1, 0, 1];

  const km = computeKaplanMeier(times, events, 'Test Cohort');
  assert.equal(km.points[0].survival, 1.0);
  assert.equal(km.points[0].time, 0);

  for (let i = 1; i < km.points.length; i++) {
    assert.ok(
      km.points[i].survival <= km.points[i - 1].survival,
      `KM survival at step ${i} (${km.points[i].survival}) should be <= previous step (${km.points[i - 1].survival})`
    );
    assert.ok(km.points[i].survival >= 0 && km.points[i].survival <= 1);
    assert.ok(km.points[i].ciLower <= km.points[i].survival);
    assert.ok(km.points[i].ciUpper >= km.points[i].survival);
  }
});

test('Log-Rank Test: detects significant difference between separated cohorts', () => {
  // Cohort 1: early deaths (poor prognosis)
  const times1 = [5, 8, 11, 14, 18, 22];
  const events1 = [1, 1, 1, 1, 1, 1];

  // Cohort 2: late deaths / high survival (good prognosis)
  const times2 = [40, 55, 60, 70, 80, 90];
  const events2 = [1, 0, 1, 0, 0, 0];

  const logRank = computeLogRankTest(times1, events1, times2, events2);
  assert.ok(logRank.chiSquare > 3.84, `Chi-square (${logRank.chiSquare}) should exceed critical value`);
  assert.ok(logRank.pValue < 0.05, `p-value (${logRank.pValue}) should be < 0.05`);
  assert.ok(logRank.hazardRatio > 1.0, `Hazard ratio (${logRank.hazardRatio}) should be > 1.0`);
});

test('Time-Dependent AUC: evaluates classification at fixed time horizon', () => {
  const times = [6, 12, 18, 48, 60, 72];
  const events = [1, 1, 1, 0, 0, 0];
  const riskScores = [0.9, 0.85, 0.8, 0.2, 0.15, 0.1];

  // At horizon 24 months: first 3 died (cases), last 3 survived past 24 (controls)
  const auc24 = computeTimeDependentAUC(times, events, riskScores, 24);
  assert.equal(auc24, 1.0);
});

test('Brier Score: computes calibration error between 0 and 1', () => {
  const times = [12, 24, 36, 48];
  const events = [1, 1, 0, 0];
  const probs = [0.1, 0.2, 0.8, 0.9];
  const brier = computeBrierScoreAtTime(times, events, probs, 30);
  assert.ok(brier < 0.15, `Brier score should be small for well calibrated probabilities, got ${brier}`);
});

test('TCGA Multi-Omics Benchmark: Multimodal deep fusion C-Index outperforms clinical baseline', async () => {
  const { TCGA_PATIENT_COHORT } = await import('../data/tcgaData');
  const times = TCGA_PATIENT_COHORT.map(p => p.survivalMonths);
  const events = TCGA_PATIENT_COHORT.map(p => p.event);

  const clinicalScores = TCGA_PATIENT_COHORT.map(p => p.modelRiskScores.clinical_only);
  const deepMultimodalScores = TCGA_PATIENT_COHORT.map(p => p.modelRiskScores.deep_attention_fusion);

  const cIndexClinical = calculateCIndex(times, events, clinicalScores);
  const cIndexMultimodal = calculateCIndex(times, events, deepMultimodalScores);

  assert.ok(cIndexClinical >= 0.58 && cIndexClinical <= 0.68, `Clinical C-index should be ~0.63, got ${cIndexClinical}`);
  assert.ok(cIndexMultimodal >= 0.74 && cIndexMultimodal <= 0.82, `Multimodal C-index should be ~0.78, got ${cIndexMultimodal}`);
  assert.ok(cIndexMultimodal > cIndexClinical + 0.10, 'Multimodal fusion must show substantial gain over clinical alone');
});
