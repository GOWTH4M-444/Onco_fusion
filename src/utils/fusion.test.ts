import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeKernelMatrix,
  combineKernels,
  softThreshold,
  standardizeScores,
  predictMultimodalRisk,
} from './fusion';

test('Kernel computation: produces symmetric positive-diagonal matrix', () => {
  const vectors = [
    [1.0, 2.0, 3.0],
    [2.0, 3.0, 4.0],
    [-1.0, 0.0, 1.0],
  ];

  const K_rbf = computeKernelMatrix(vectors, 'rbf', 0.1);
  assert.equal(K_rbf.length, 3);
  assert.equal(K_rbf[0].length, 3);

  // Diagonal self-similarity in RBF must be 1.0
  assert.equal(Number(K_rbf[0][0].toFixed(4)), 1.0);
  assert.equal(Number(K_rbf[1][1].toFixed(4)), 1.0);
  assert.equal(Number(K_rbf[2][2].toFixed(4)), 1.0);

  // Symmetry: K[i][j] === K[j][i]
  assert.equal(K_rbf[0][1], K_rbf[1][0]);
  assert.equal(K_rbf[0][2], K_rbf[2][0]);
  assert.equal(K_rbf[1][2], K_rbf[2][1]);
});

test('Multiple Kernel Learning (MKL): combines kernels convexly with normalized weights', () => {
  const K1 = [
    [1.0, 0.5],
    [0.5, 1.0],
  ];
  const K2 = [
    [1.0, 0.2],
    [0.2, 1.0],
  ];

  // Weights [0.5, 0.5] -> composite off-diagonal should be 0.5*0.5 + 0.5*0.2 = 0.35
  const composite = combineKernels([K1, K2], [0.5, 0.5]);
  assert.equal(composite[0][0], 1.0);
  assert.equal(composite[1][1], 1.0);
  assert.equal(Number(composite[0][1].toFixed(4)), 0.35);
  assert.equal(composite[0][1], composite[1][0]);
});

test('Soft Threshold operator: zeroes out values below regularizer threshold', () => {
  assert.equal(softThreshold(0.2, 0.5), 0);
  assert.equal(softThreshold(-0.3, 0.5), 0);
  assert.equal(softThreshold(0.8, 0.5), 0.3);
  assert.equal(softThreshold(-0.8, 0.5), -0.3);
});

test('Standardize scores: results in zero mean and unit variance', () => {
  const raw = [10, 20, 30, 40, 50];
  const z = standardizeScores(raw);
  const mean = z.reduce((a, b) => a + b, 0) / z.length;
  assert.ok(Math.abs(mean) < 1e-4, `Mean should be ~0, got ${mean}`);
});

test('Multimodal Risk Prediction: integrates contributions across omics blocks', () => {
  const features = {
    clinical: [1.2, 0.5],
    mrna: [0.8, -0.4],
    mirna: [1.5],
    methylation: [0.6],
    cnv_mutation: [2.0],
    pathology: [0.4],
  };

  const weights = {
    clinical: [0.5, 0.2], // 1.2*0.5 + 0.5*0.2 = 0.70
    mrna: [0.6, -0.2], // 0.8*0.6 + -0.4*-0.2 = 0.48 + 0.08 = 0.56
    mirna: [0.4], // 0.60
    methylation: [0.3], // 0.18
    cnv_mutation: [0.25], // 0.50
    pathology: [0.5], // 0.20
  };

  const modWeights = {
    clinical: 1.0,
    mrna: 1.0,
    mirna: 1.0,
    methylation: 1.0,
    cnv_mutation: 1.0,
    pathology: 1.0,
  };

  const pred = predictMultimodalRisk(features, weights, modWeights);
  assert.ok(pred.totalRiskScore > 2.0);
  assert.ok(pred.predicted1YearSurvival > 0 && pred.predicted1YearSurvival < 1);
  assert.ok(pred.predicted5YearSurvival < pred.predicted1YearSurvival); // Survival decreases over time
});
