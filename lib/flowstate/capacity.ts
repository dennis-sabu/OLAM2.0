/**
 * FlowState Capacity Engine
 *
 * Calculates effective study capacity from daily state inputs using bounded
 * deterministic factors. This is a productivity-planning heuristic only —
 * it does not diagnose, measure, or infer any medical or mental-health condition.
 */

import { DailyState } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Effective capacity cannot exceed available time. */
const MAX_CAPACITY_RATIO = 1.0;
/** Effective capacity cannot drop below this ratio of available time. */
const MIN_CAPACITY_RATIO = 0.25;

// ── Individual factors ────────────────────────────────────────────────────────

/**
 * Energy factor: low energy reduces usable capacity.
 * Range: energy 1→0.73, energy 10→1.00
 */
export function energyFactor(energy: number): number {
  const e = Math.max(1, Math.min(10, energy));
  return 0.70 + (e * 0.03);
}

/**
 * Stress factor: high stress reduces usable capacity.
 * Range: stress 1→1.00, stress 10→0.82
 */
export function stressFactor(stress: number): number {
  const s = Math.max(1, Math.min(10, stress));
  return 1.00 - ((s - 1) * 0.02);
}

/**
 * Sleep factor: insufficient or excessive sleep reduces capacity.
 * Optimal band is 7–8 h. Below 5 h drops steeply.
 */
export function sleepFactor(sleep: number): number {
  const s = Math.max(0, Math.min(12, sleep));
  if (s >= 7) {
    // 7+ h: optimal or close to it; mild drop for > 9 h
    return Math.min(1.0, 1.0 - Math.max(0, s - 9) * 0.02);
  }
  if (s >= 5) {
    // 5–7 h: linear decay from 0.90 → 0.70
    return 0.70 + ((s - 5) / 2) * 0.20;
  }
  // < 5 h: steep penalty
  return Math.max(0.40, 0.70 - (5 - s) * 0.10);
}

// ── Main capacity calculation ─────────────────────────────────────────────────

/**
 * Returns effective study capacity in minutes.
 *
 * capacity = availableMinutes × energyFactor × stressFactor × sleepFactor
 *
 * Clamped to [MIN_CAPACITY_RATIO × available, available].
 */
export function calculateCapacity(dailyState: DailyState): number {
  const { availableTime, energy, stress, sleep } = dailyState;

  const raw =
    availableTime *
    energyFactor(energy) *
    stressFactor(stress) *
    sleepFactor(sleep);

  const min = availableTime * MIN_CAPACITY_RATIO;
  const max = availableTime * MAX_CAPACITY_RATIO;
  return Math.round(Math.min(max, Math.max(min, raw)));
}

/**
 * Returns a human-readable breakdown of which factors reduced capacity,
 * for display on the Daily State and Planner pages.
 */
export function capacityExplanation(dailyState: DailyState): string {
  const { energy, stress, sleep } = dailyState;
  const parts: string[] = [];

  if (energy <= 4) parts.push("low energy");
  if (stress >= 7) parts.push("high stress");
  if (sleep < 6) parts.push("insufficient sleep");

  if (parts.length === 0) return "Your state is well balanced for productive work today.";
  return `Capacity reduced due to: ${parts.join(", ")}. Consider protecting your minimum viable day.`;
}
