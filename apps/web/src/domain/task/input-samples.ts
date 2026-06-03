import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Task } from "@/types";

/** Default mock sample counts per template (lab plate batch sizes). */
const MOCK_SAMPLE_COUNT_BY_TEMPLATE: Record<string, number> = {
  "01909d1c-7da1-79aa-fe76-4c350d61a79c": 96,
  "a52e40c7-db76-46fe-bdc5-bf51522457c1": 96,
  "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c": 96,
  "019662b2-9810-c712-7501-98b5b6a68b58": 48,
  "01979c72-1e66-2a8e-555b-3cf5c9f56a06": 96,
  "01954733-5f3c-c54a-ac46-720de477e712": 96,
  "0195615e-c56d-603b-0b43-522cbdb52634": 24,
  "0196a064-9351-576b-9c4c-3b08f48f1f1e": 48,
  "0196a00c-e983-91f4-4131-096e8db90a40": 48,
  "f94f1058-8e24-4471-aa8b-406b0564cfbf": 96,
  "1fa2fc3f-adc6-46df-96cb-cafc71f7e7c9": 96,
};

const FALLBACK_SAMPLE_COUNTS = [24, 48, 96, 192] as const;

function templateHandlesSamples(taskTemplateId: string): boolean {
  const template = getTaskTemplate(taskTemplateId);
  return (template?.requiredPlateTypes?.length ?? 0) > 0;
}

/** Deterministic mock count for planning demos when not set explicitly. */
export function mockInputSampleCount(
  taskTemplateId: string,
  taskId: string,
): number | undefined {
  if (!templateHandlesSamples(taskTemplateId)) return undefined;

  const preset = MOCK_SAMPLE_COUNT_BY_TEMPLATE[taskTemplateId];
  if (preset !== undefined) return preset;

  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    hash = (hash + taskId.charCodeAt(i)) % FALLBACK_SAMPLE_COUNTS.length;
  }
  return FALLBACK_SAMPLE_COUNTS[hash]!;
}

export function resolveInputSampleCount(task: Task): number | undefined {
  if (task.inputSampleCount !== undefined && task.inputSampleCount > 0) {
    return task.inputSampleCount;
  }
  return mockInputSampleCount(task.taskTemplateId, task.id);
}

export function aggregateInputSampleCount(tasks: Task[]): number {
  return tasks.reduce((sum, task) => sum + (resolveInputSampleCount(task) ?? 0), 0);
}

export function formatInputSampleCount(count: number): string {
  return count === 1 ? "1 sample" : `${count} samples`;
}
