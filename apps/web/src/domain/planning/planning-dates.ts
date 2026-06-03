export const PLANNING_DAY_RANGE_DAYS = 14;

export function toPlanningDayString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parsePlanningDay(day: string): Date {
  return new Date(`${day}T12:00:00`);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addLocalDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return startOfLocalDay(result);
}

export function getPlanningDayBounds(referenceDate = new Date()) {
  const today = startOfLocalDay(referenceDate);
  const minDate = addLocalDays(today, -PLANNING_DAY_RANGE_DAYS);
  const maxDate = addLocalDays(today, PLANNING_DAY_RANGE_DAYS);

  return {
    minDate,
    maxDate,
    minDay: toPlanningDayString(minDate),
    maxDay: toPlanningDayString(maxDate),
  };
}

export function getDefaultPlanningDay(): string {
  return toPlanningDayString(new Date());
}

export function clampPlanningDay(day: string): string {
  const { minDay, maxDay } = getPlanningDayBounds();
  if (day < minDay) return minDay;
  if (day > maxDay) return maxDay;
  return day;
}

export function stepPlanningDay(day: string, delta: number): string {
  const next = addLocalDays(parsePlanningDay(day), delta);
  return clampPlanningDay(toPlanningDayString(next));
}

  const { minDay, maxDay } = getPlanningDayBounds();
  return day >= minDay && day <= maxDay;
}
