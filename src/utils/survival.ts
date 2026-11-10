/**
 * Survival Analysis Engine: Harrell's C-Index, Kaplan-Meier Estimator,
 * Greenwood's Confidence Intervals, Log-Rank Hypothesis Testing, and Time-Dependent AUC.
 */

export interface SurvivalDataPoint {
  time: number; // Survival or follow-up time (months)
  event: number; // 1 = Death / Event occurred, 0 = Censored (alive at last contact)
  riskScore: number; // Higher score indicates higher predicted risk of death
}

export interface KaplanMeierPoint {
  time: number;
  nAtRisk: number;
  nEvents: number;
  nCensored: number;
  survival: number; // S(t)
  stderr: number;
  ciLower: number; // 95% CI Lower
  ciUpper: number; // 95% CI Upper
}

export interface KaplanMeierCurve {
  groupName: string;
  color: string;
  points: KaplanMeierPoint[];
  medianSurvival: number | null; // Median survival time (months)
  totalPatients: number;
  totalEvents: number;
}

export interface LogRankResult {
  chiSquare: number;
  pValue: number;
  degreesOfFreedom: number;
  hazardRatio: number;
  hrCiLower: number;
  hrCiUpper: number;
  observed1: number;
  expected1: number;
  observed2: number;
  expected2: number;
}

/**
 * Calculates Harrell's Concordance Index (C-Index) with proper right-censoring handling.
 * C = 0.5 indicates random guess; C = 1.0 indicates perfect survival concordance.
 */
export function calculateCIndex(
  times: number[],
  events: number[],
  riskScores: number[]
): number {
  const n = times.length;
  if (n < 2) return 0.5;

  let concordantPairs = 0;
  let usablePairs = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const timeI = times[i];
      const timeJ = times[j];
      const eventI = events[i];
      const eventJ = events[j];
      const riskI = riskScores[i];
      const riskJ = riskScores[j];

      // Standard Harrell's rules for usable pairs in survival analysis:
      // Case 1: timeI < timeJ and patient i experienced the event
      if (timeI < timeJ && eventI === 1) {
        usablePairs++;
        if (riskI > riskJ) {
          concordantPairs += 1.0;
        } else if (riskI === riskJ) {
          concordantPairs += 0.5;
        }
      }
      // Case 2: timeJ < timeI and patient j experienced the event
      else if (timeJ < timeI && eventJ === 1) {
        usablePairs++;
        if (riskJ > riskI) {
          concordantPairs += 1.0;
        } else if (riskI === riskJ) {
          concordantPairs += 0.5;
        }
      }
      // Case 3: Tied survival times with events
      else if (timeI === timeJ) {
        if (eventI === 1 && eventJ === 1) {
          usablePairs++;
          if (riskI === riskJ) {
            concordantPairs += 1.0;
          } else {
            concordantPairs += 0.5;
          }
        } else if (eventI === 1 && eventJ === 0) {
          // Patient i died at time T, patient j lived at least past time T
          usablePairs++;
          if (riskI > riskJ) {
            concordantPairs += 1.0;
          } else if (riskI === riskJ) {
            concordantPairs += 0.5;
          }
        } else if (eventI === 0 && eventJ === 1) {
          usablePairs++;
          if (riskJ > riskI) {
            concordantPairs += 1.0;
          } else if (riskI === riskJ) {
            concordantPairs += 0.5;
          }
        }
      }
    }
  }

  if (usablePairs === 0) return 0.5;
  return Number((concordantPairs / usablePairs).toFixed(4));
}

/**
 * Computes Kaplan-Meier survival curves S(t) with Greenwood standard errors and 95% log-log CIs.
 */
export function computeKaplanMeier(
  times: number[],
  events: number[],
  groupName: string,
  color: string = '#0ea5e9'
): KaplanMeierCurve {
  const n = times.length;
  if (n === 0) {
    return {
      groupName,
      color,
      points: [{ time: 0, nAtRisk: 0, nEvents: 0, nCensored: 0, survival: 1, stderr: 0, ciLower: 1, ciUpper: 1 }],
      medianSurvival: null,
      totalPatients: 0,
      totalEvents: 0,
    };
  }

  // Sort by time ascending; if tied, events before censored
  const indices = Array.from({ length: n }, (_, i) => i);
  indices.sort((a, b) => {
    if (times[a] !== times[b]) return times[a] - times[b];
    return events[b] - events[a];
  });

  // Unique failure and censoring timepoints
  const timeMap = new Map<number, { events: number; censored: number }>();
  for (const idx of indices) {
    const t = times[idx];
    const e = events[idx];
    const curr = timeMap.get(t) || { events: 0, censored: 0 };
    if (e === 1) curr.events++;
    else curr.censored++;
    timeMap.set(t, curr);
  }

  const sortedTimes = Array.from(timeMap.keys()).sort((a, b) => a - b);

  let currentAtRisk = n;
  let currentSurvival = 1.0;
  let greenwoodSum = 0;
  let medianSurvival: number | null = null;
  let totalEvents = 0;

  const points: KaplanMeierPoint[] = [
    {
      time: 0,
      nAtRisk: n,
      nEvents: 0,
      nCensored: 0,
      survival: 1.0,
      stderr: 0,
      ciLower: 1.0,
      ciUpper: 1.0,
    },
  ];

  for (const t of sortedTimes) {
    const { events: d, censored: c } = timeMap.get(t)!;
    totalEvents += d;

    if (d > 0 && currentAtRisk > 0) {
      currentSurvival *= 1 - d / currentAtRisk;
      if (currentAtRisk > d) {
        greenwoodSum += d / (currentAtRisk * (currentAtRisk - d));
      }
    }

    const stderr = currentSurvival * Math.sqrt(greenwoodSum);

    // 95% Log-log confidence interval (guarantees bounds between 0 and 1)
    let ciLower = currentSurvival;
    let ciUpper = currentSurvival;

    if (currentSurvival > 0 && currentSurvival < 1 && greenwoodSum > 0) {
      const z = 1.96;
      const logS = Math.log(currentSurvival);
      const theta = (z * Math.sqrt(greenwoodSum)) / Math.abs(logS);
      ciLower = Math.pow(currentSurvival, Math.exp(theta));
      ciUpper = Math.pow(currentSurvival, Math.exp(-theta));
      ciLower = Math.max(0, Math.min(1, ciLower));
      ciUpper = Math.max(0, Math.min(1, ciUpper));
    }

    if (medianSurvival === null && currentSurvival <= 0.5) {
      medianSurvival = t;
    }

    points.push({
      time: t,
      nAtRisk: currentAtRisk,
      nEvents: d,
      nCensored: c,
      survival: Number(currentSurvival.toFixed(4)),
      stderr: Number(stderr.toFixed(4)),
      ciLower: Number(ciLower.toFixed(4)),
      ciUpper: Number(ciUpper.toFixed(4)),
    });

    currentAtRisk -= d + c;
  }

  return {
    groupName,
    color,
    points,
    medianSurvival,
    totalPatients: n,
    totalEvents,
  };
}

/**
 * Calculates two-sample Log-Rank Test comparing survival distributions.
 */
export function computeLogRankTest(
  times1: number[],
  events1: number[],
  times2: number[]
,  events2: number[]
): LogRankResult {
  const n1 = times1.length;
  const n2 = times2.length;

  if (n1 === 0 || n2 === 0) {
    return {
      chiSquare: 0,
      pValue: 1,
      degreesOfFreedom: 1,
      hazardRatio: 1,
      hrCiLower: 1,
      hrCiUpper: 1,
      observed1: 0,
      expected1: 0,
      observed2: 0,
      expected2: 0,
    };
  }

  // Combine unique times where events occurred in either group
  const eventTimesSet = new Set<number>();
  times1.forEach((t, i) => { if (events1[i] === 1) eventTimesSet.add(t); });
  times2.forEach((t, i) => { if (events2[i] === 1) eventTimesSet.add(t); });
  const eventTimes = Array.from(eventTimesSet).sort((a, b) => a - b);

  let observed1 = 0;
  let expected1 = 0;
  let variance1 = 0;

  let observed2 = 0;
  let expected2 = 0;

  for (const t of eventTimes) {
    // Number at risk at time t
    const y1 = times1.filter((time) => time >= t).length;
    const y2 = times2.filter((time) => time >= t).length;
    const y = y1 + y2;

    // Number of events at time t
    const d1 = times1.filter((time, i) => time === t && events1[i] === 1).length;
    const d2 = times2.filter((time, i) => time === t && events2[i] === 1).length;
    const d = d1 + d2;

    observed1 += d1;
    observed2 += d2;

    if (y > 1 && d > 0) {
      const exp1 = (y1 / y) * d;
      const exp2 = (y2 / y) * d;
      expected1 += exp1;
      expected2 += exp2;

      const varT = (y1 * y2 * d * (y - d)) / (y * y * (y - 1));
      variance1 += varT;
    }
  }

  let chiSquare = 0;
  if (variance1 > 0) {
    chiSquare = Math.pow(observed1 - expected1, 2) / variance1;
  }

  // Approx p-value from chi-square distribution with df = 1: p = 2 * (1 - NormalCDF(sqrt(chiSquare)))
  const zScore = Math.sqrt(Math.max(0, chiSquare));
  const pValue = 2 * (1 - normalCDF(zScore));

  // Hazard ratio estimate: (O1 / E1) / (O2 / E2)
  let hazardRatio = 1.0;
  let hrCiLower = 1.0;
  let hrCiUpper = 1.0;

  if (expected1 > 0 && expected2 > 0 && observed2 > 0) {
    hazardRatio = (observed1 / expected1) / (observed2 / expected2);
    // Standard error of log HR ~ sqrt(1/variance1)
    if (variance1 > 0 && hazardRatio > 0) {
      const seLogHr = Math.sqrt(1 / variance1);
      hrCiLower = Math.exp(Math.log(hazardRatio) - 1.96 * seLogHr);
      hrCiUpper = Math.exp(Math.log(hazardRatio) + 1.96 * seLogHr);
    }
  }

  return {
    chiSquare: Number(chiSquare.toFixed(3)),
    pValue: Number(Math.max(0.00001, pValue).toFixed(5)),
    degreesOfFreedom: 1,
    hazardRatio: Number(hazardRatio.toFixed(2)),
    hrCiLower: Number(hrCiLower.toFixed(2)),
    hrCiUpper: Number(hrCiUpper.toFixed(2)),
    observed1,
    expected1: Number(expected1.toFixed(1)),
    observed2,
    expected2: Number(expected2.toFixed(1)),
  };
}

/**
 * Cumulative/Dynamic Time-Dependent AUC at fixed evaluation time t (e.g. 12, 36, 60 months).
 * Cases: patients who had an event by time t (t_i <= t and event_i == 1)
 * Controls: patients who survived past time t (t_j > t)
 */
export function computeTimeDependentAUC(
  times: number[],
  events: number[],
  riskScores: number[],
  horizon: number
): number {
  const cases: number[] = [];
  const controls: number[] = [];

  for (let i = 0; i < times.length; i++) {
    if (times[i] <= horizon && events[i] === 1) {
      cases.push(riskScores[i]);
    } else if (times[i] > horizon) {
      controls.push(riskScores[i]);
    }
  }

  if (cases.length === 0 || controls.length === 0) {
    return 0.5;
  }

  let concordant = 0;
  let total = 0;

  for (const c of cases) {
    for (const ctrl of controls) {
      total++;
      if (c > ctrl) {
        concordant += 1.0;
      } else if (c === ctrl) {
        concordant += 0.5;
      }
    }
  }

  return Number((concordant / total).toFixed(3));
}

/**
 * Calculates Brier Score at evaluation time t.
 * BS(t) = (1/N) sum (I(T_i > t) - S(t|x_i))^2
 */
export function computeBrierScoreAtTime(
  times: number[],
  events: number[],
  predictedSurvivalProbs: number[],
  horizon: number
): number {
  let sumSq = 0;
  let count = 0;

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const e = events[i];
    const predS = predictedSurvivalProbs[i];

    // Only patients whose status is unambiguously known at horizon t:
    // Either survived past t, or died before/at t
    if (t > horizon) {
      // Survived past t: actual status Y = 1
      sumSq += Math.pow(1 - predS, 2);
      count++;
    } else if (t <= horizon && e === 1) {
      // Died before t: actual status Y = 0
      sumSq += Math.pow(0 - predS, 2);
      count++;
    }
  }

  if (count === 0) return 0.25;
  return Number((sumSq / count).toFixed(4));
}

/**
 * Standard Normal Cumulative Distribution Function approximation (Abramowitz & Stegun).
 */
export function normalCDF(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX));

  return 0.5 * (1.0 + sign * y);
}
