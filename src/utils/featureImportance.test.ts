import test from 'node:test';
import assert from 'node:assert/strict';
import { rankFeatures, TCGA_FEATURE_IMPORTANCES } from './featureImportance';

test('Feature Ranking: returns all features sorted by importance score', () => {
  const ranked = rankFeatures('ALL', 'ALL', 'deep_attention_fusion', 'absolute');
  assert.ok(ranked.length > 10, 'Should return comprehensive list of features');

  // Verify non-increasing order of importance
  for (let i = 1; i < ranked.length; i++) {
    const prevScore = ranked[i - 1].importanceScores.deep_attention_fusion;
    const curScore = ranked[i].importanceScores.deep_attention_fusion;
    assert.ok(prevScore >= curScore, `Ranked feature ${i-1} (${prevScore}) should be >= feature ${i} (${curScore})`);
  }
});

test('Feature Ranking: correctly filters by specific omics modality', () => {
  const mrnaOnly = rankFeatures('ALL', 'mRNA', 'deep_attention_fusion', 'absolute');
  assert.ok(mrnaOnly.length > 0);
  assert.ok(mrnaOnly.every(f => f.modality === 'mRNA'), 'All returned features must belong to mRNA modality');

  const methOnly = rankFeatures('ALL', 'DNA Methylation', 'deep_attention_fusion', 'absolute');
  assert.ok(methOnly.length > 0);
  assert.ok(methOnly.every(f => f.modality === 'DNA Methylation'));
});

test('Feature Ranking: separates adverse risk vs protective survival features', () => {
  const adverse = rankFeatures('ALL', 'ALL', 'deep_attention_fusion', 'adverse');
  assert.ok(adverse.every(f => f.direction === 'adverse' && f.hazardRatio > 1.0));

  const protective = rankFeatures('ALL', 'ALL', 'deep_attention_fusion', 'protective');
  assert.ok(protective.every(f => f.direction === 'protective' && f.hazardRatio < 1.0));
});

test('Feature Ranking: filters by cancer cohort affinity', () => {
  const gbmFeatures = rankFeatures('GBM', 'ALL', 'deep_attention_fusion', 'absolute');
  const hasMgmt = gbmFeatures.some(f => f.id === 'mgmt_meth');
  assert.ok(hasMgmt, 'GBM cohort must include MGMT promoter methylation as a key biomarker');
});
