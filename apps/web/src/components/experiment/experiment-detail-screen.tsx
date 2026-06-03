import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { MetaRow } from "@/components/context/primitives/meta-row";
import {
  EXPERIMENT_PRIORITY_LABEL,
  formatExperimentPriority,
} from "@/components/experiment/experiment-priority";
import { ExperimentRunCard } from "@/components/experiment/experiment-run-card";
import { ExperimentRunCreationPanel } from "@/components/experiment/experiment-run-creation-panel";
import { TaskDetailDialog } from "@/components/task/task-detail-dialog";
import type { Task } from "@/types";
import type { ExperimentDetail } from "@/types/experiment";
import {
  EXPERIMENT_CATEGORY_LABEL,
  EXPERIMENT_TYPE_LABEL,
} from "@/types/experiment";
import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { Button } from "@adaptyv-coordination/ui/components/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@adaptyv-coordination/ui/components/resizable";

const RUN_CREATION_OPEN_LAYOUT = {
  "experiment-context": 38,
  "experiment-run-creation": 62,
} as const;

type ExperimentDetailContentProps = {
  experiment: ExperimentDetail;
  onOpenCreation: () => void;
};

function ExperimentDetailContent({
  experiment,
  onOpenCreation,
}: ExperimentDetailContentProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { runs: _runs, ...experimentSummary } = experiment;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link
        to="/experiments"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Back to experiments
      </Link>

      <div className="mt-6 space-y-6">
        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{experiment.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {experiment.code}
              </p>
            </div>
            <Badge
              variant={experiment.status === "synced" ? "outline" : "default"}
            >
              {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MetaRow
              label={EXPERIMENT_PRIORITY_LABEL}
              value={formatExperimentPriority(experiment.priority)}
            />
            <MetaRow label="Type" value={EXPERIMENT_TYPE_LABEL[experiment.type]} />
            <MetaRow
              label="Category"
              value={EXPERIMENT_CATEGORY_LABEL[experiment.category]}
            />
            <MetaRow label="Client" value={experiment.client.name} />
            {experiment.methodName ? (
              <MetaRow label="Method" value={experiment.methodName} />
            ) : null}
            {experiment.dueDate ? (
              <MetaRow label="Due Date" value={experiment.dueDate} />
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium">Experiment runs</h2>
            <Button type="button" size="sm" onClick={onOpenCreation}>
              <Plus className="mr-1.5 size-4" />
              Create new run
            </Button>
          </div>

          {experiment.runs.length > 0 ? (
            <div className="space-y-3">
              {[...experiment.runs]
                .sort((a, b) => b.revisionIndex - a.revisionIndex)
                .map((run, index) => (
                  <ExperimentRunCard
                    key={run.id}
                    run={run}
                    experiment={experimentSummary}
                    defaultExpanded={index === 0}
                    onTaskOpen={setSelectedTask}
                  />
                ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No runs created yet</p>
              <p className="mt-1 text-sm">
                Create your first run to start working with this experiment
              </p>
              <Button
                type="button"
                className="mt-4"
                size="sm"
                onClick={onOpenCreation}
              >
                <Plus className="mr-1.5 size-4" />
                Create new run
              </Button>
            </div>
          )}
        </div>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedTask(null);
        }}
      />
    </div>
  );
}

type ExperimentDetailScreenProps = {
  experiment: ExperimentDetail;
};

export function ExperimentDetailScreen({ experiment }: ExperimentDetailScreenProps) {
  const [isCreationOpen, setIsCreationOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {isCreationOpen ? (
        <ResizablePanelGroup
          key="experiment-with-creation"
          storageId={`experiment-detail-creation-${experiment.id}`}
          panelIds={["experiment-context", "experiment-run-creation"]}
          orientation="vertical"
          persistLayout={false}
          defaultLayout={RUN_CREATION_OPEN_LAYOUT}
          className="h-full min-h-0 flex-1"
        >
          <ResizablePanel
            id="experiment-context"
            minSize={20}
            className="min-h-0"
          >
            <div className="h-full min-h-0 overflow-y-auto">
              <ExperimentDetailContent
                experiment={experiment}
                onOpenCreation={() => setIsCreationOpen(true)}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle className="my-0.5" />

          <ResizablePanel
            id="experiment-run-creation"
            minSize={30}
            className="min-h-0"
          >
            <ExperimentRunCreationPanel
              onClose={() => setIsCreationOpen(false)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ExperimentDetailContent
            experiment={experiment}
            onOpenCreation={() => setIsCreationOpen(true)}
          />
        </div>
      )}
    </div>
  );
}
