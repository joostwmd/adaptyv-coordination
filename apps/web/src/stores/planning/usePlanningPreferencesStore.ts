import { create } from "zustand";

import {
  DEFAULT_PRIORITY_WEIGHTS,
  PRIORITY_WEIGHT_PRESETS,
  type PriorityDimension,
  type PriorityWeights,
} from "@/domain/priority";

interface PlanningPreferencesState {
  weights: PriorityWeights;
  setWeights: (weights: PriorityWeights) => void;
  updateWeight: (dimension: PriorityDimension, value: number) => void;
  applyWeightPreset: (presetName: keyof typeof PRIORITY_WEIGHT_PRESETS) => void;
}

export const usePlanningPreferencesStore = create<PlanningPreferencesState>((set) => ({
  weights: DEFAULT_PRIORITY_WEIGHTS,

  setWeights: (weights) => set({ weights }),

  updateWeight: (dimension, value) =>
    set((state) => ({
      weights: {
        ...state.weights,
        [dimension]: Math.max(0, Math.min(1, value)),
      },
    })),

  applyWeightPreset: (presetName) =>
    set({
      weights: PRIORITY_WEIGHT_PRESETS[presetName] ?? DEFAULT_PRIORITY_WEIGHTS,
    }),
}));

export const usePlanningWeights = () =>
  usePlanningPreferencesStore((state) => state.weights);
