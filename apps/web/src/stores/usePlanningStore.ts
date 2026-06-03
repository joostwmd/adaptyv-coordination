/**
 * @deprecated Import from `@/stores/planning/usePlanningBoardStore` and
 * `@/stores/planning/usePlanningPreferencesStore` instead.
 */
import {
  usePlanningBoardStore,
  usePlanningCurrentDay,
  usePlanningTasks,
  usePlanningTickets,
  usePlanningWorkUnits,
} from "./planning/usePlanningBoardStore";
import {
  usePlanningPreferencesStore,
  usePlanningWeights,
} from "./planning/usePlanningPreferencesStore";

export type { BlockedReason } from "./planning/planning-board-selectors";
export {
  usePlanningBoardStore,
  usePlanningCurrentDay,
  usePlanningPreferencesStore,
  usePlanningTasks,
  usePlanningTickets,
  usePlanningWeights,
  usePlanningWorkUnits,
};

export type PlanningFacadeState = ReturnType<typeof usePlanningBoardStore.getState> &
  ReturnType<typeof usePlanningPreferencesStore.getState>;

function getPlanningFacadeState(): PlanningFacadeState {
  return {
    ...usePlanningBoardStore.getState(),
    ...usePlanningPreferencesStore.getState(),
  };
}

/** @deprecated Use split stores directly */
export function usePlanningStore<T>(selector: (state: PlanningFacadeState) => T): T {
  const board = usePlanningBoardStore();
  const preferences = usePlanningPreferencesStore();
  return selector({ ...board, ...preferences });
}

usePlanningStore.getState = getPlanningFacadeState;
