import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adaptyv-coordination/ui/components/card";
import { Button } from "@adaptyv-coordination/ui/components/button";

import {
  EXPERIMENT_PRIORITY_LABEL,
  formatExperimentPriority,
} from "@/components/experiment";
import { useExperimentById } from "@/stores/usePrototypeStore";
import type { Task } from "@/types";
import { getTaskDisplayName } from "@/types/task";

import { AssigneeRow } from "./primitives/assignee-row";
import { ExperimentLink } from "./primitives/experiment-link";
import { ExperimentRunLink } from "./primitives/experiment-run-link";
import { NotesThreadPreview } from "./primitives/notes-thread-preview";
import { StatusBadge } from "./primitives/status-badge";

type TaskCardProps = {
  task: Task;
  onView: (task: Task) => void;
};

export function TaskCard({ task, onView }: TaskCardProps) {
  const experiment = useExperimentById(task.experimentId ?? "");
  const summary = experiment
    ? (() => {
        const { runs: _runs, ...rest } = experiment;
        return rest;
      })()
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="min-w-0 flex-1">{getTaskDisplayName(task)}</CardTitle>
          <StatusBadge status={task.status} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {task.assignee ? <AssigneeRow assignee={task.assignee} /> : null}
        {summary ? (
          <p className="text-xs/relaxed">
            <span className="text-muted-foreground">{EXPERIMENT_PRIORITY_LABEL} </span>
            <span className="font-medium">
              {formatExperimentPriority(summary.priority)}
            </span>
            <span className="text-muted-foreground"> ({summary.code})</span>
          </p>
        ) : null}
        {task.experimentId && task.runId ? (
          <ExperimentRunLink
            experimentId={task.experimentId}
            runId={task.runId}
          />
        ) : null}
        {summary ? <ExperimentLink experiment={summary} /> : null}
        <NotesThreadPreview notes={task.notes} />
      </CardContent>

      <CardFooter>
        <Button variant="ghost" size="sm" onClick={() => onView(task)}>
          View task
        </Button>
      </CardFooter>
    </Card>
  );
}
