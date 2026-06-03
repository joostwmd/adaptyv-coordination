import { type ColumnDef } from "@tanstack/react-table";
import { RefreshCw, Search, TestTube2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { DataTable } from "@adaptyv-coordination/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@adaptyv-coordination/ui/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@adaptyv-coordination/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@adaptyv-coordination/ui/hooks/use-data-table";
import { Button } from "@adaptyv-coordination/ui/components/button";
import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { useExperiments, useClientsFromExperiments } from "@/hooks/useExperiments";
import type {
  ExperimentListItem,
  ExperimentType,
  ExperimentRunSummary,
} from "@/types/experiment";
import {
  formatExperimentStatus,
  getExperimentStatusBadgeVariant,
} from "@/entities/experiment/experiment-run-status";
import { EXPERIMENT_TYPE_LABEL, EXPERIMENT_CATEGORY_LABEL } from "@/types/experiment";

type RunStats = {
  total: number;
  inProgress: number;
  completed: number;
  failed: number;
};

function getRunStats(runs: ExperimentRunSummary[]): RunStats {
  return runs.reduce(
    (stats, run) => {
      stats.total++;
      switch (run.status) {
        case "in_progress":
          stats.inProgress++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "failed":
          stats.failed++;
          break;
      }
      return stats;
    },
    { total: 0, inProgress: 0, completed: 0, failed: 0 },
  );
}

function RunCountCell({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return <span className="text-sm tabular-nums">{count}</span>;
}

function sortableRunColumn(
  id: string,
  label: string,
  getCount: (stats: RunStats) => number,
): ColumnDef<ExperimentListItem> {
  return {
    id,
    accessorFn: (row) => getCount(getRunStats(row.runs ?? [])),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label={label} />
    ),
    cell: ({ row }) => (
      <RunCountCell count={getCount(getRunStats(row.original.runs ?? []))} />
    ),
    enableSorting: true,
  };
}

export function ExperimentsTable() {
  const navigate = useNavigate();
  const { experiments } = useExperiments();
  const clients = useClientsFromExperiments();

  const handleRowClick = useCallback(
    (row: { original: ExperimentListItem }) => {
      void navigate({
        to: "/experiments/$experimentId",
        params: { experimentId: row.original.id },
      });
    },
    [navigate],
  );

  const columns = useMemo<ColumnDef<ExperimentListItem>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Experiment",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            <span className="text-sm text-muted-foreground">
              {row.original.code}
            </span>
          </div>
        ),
        meta: {
          label: "Experiment",
          placeholder: "Search experiments...",
          variant: "text",
          icon: Search,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: "type",
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as ExperimentType;
          return (
            <Badge variant="secondary">{EXPERIMENT_TYPE_LABEL[type]}</Badge>
          );
        },
        meta: {
          label: "Type",
          variant: "select",
          options: Object.entries(EXPERIMENT_TYPE_LABEL).map(
            ([value, label]) => ({
              label,
              value,
            }),
          ),
          icon: TestTube2,
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={getExperimentStatusBadgeVariant(status)}>
              {formatExperimentStatus(status)}
            </Badge>
          );
        },
        meta: {
          label: "Status",
          variant: "select",
          options: [
            { label: "Synced", value: "synced" },
            { label: "Configured", value: "configured" },
          ],
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      sortableRunColumn("runsTotal", "Total runs", (s) => s.total),
      sortableRunColumn("runsInProgress", "In progress", (s) => s.inProgress),
      sortableRunColumn("runsDone", "Done", (s) => s.completed),
      sortableRunColumn("runsFailed", "Failed", (s) => s.failed),
      {
        id: "client",
        accessorFn: (row) => row.client.name,
        header: "Client",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.client.name}</span>
        ),
        meta: {
          label: "Client",
          variant: "select",
          options: clients.map((client) => ({
            label: client.name,
            value: client.id,
          })),
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: "category",
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.getValue("category") as string;
          return (
            <Badge variant="outline">
              {
                EXPERIMENT_CATEGORY_LABEL[
                  category as keyof typeof EXPERIMENT_CATEGORY_LABEL
                ]
              }
            </Badge>
          );
        },
        meta: {
          label: "Category",
          variant: "select",
          options: Object.entries(EXPERIMENT_CATEGORY_LABEL).map(
            ([value, label]) => ({
              label,
              value,
            }),
          ),
        },
        enableColumnFilter: true,
        enableSorting: false,
      },
      {
        id: "dueDate",
        accessorKey: "dueDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Due date" />
        ),
        cell: ({ row }) => {
          const dueDate = row.getValue("dueDate") as string;
          if (!dueDate) return <span className="text-muted-foreground">—</span>;

          return (
            <span className="text-sm">
              {new Date(dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          );
        },
        enableSorting: true,
      },
    ],
    [clients],
  );

  const { table } = useDataTable({
    data: experiments,
    columns,
    initialState: {
      sorting: [{ id: "dueDate", desc: false }],
      pagination: { pageSize: 10 },
    },
    getRowId: (row) => row.id,
  });

  const handleSyncFromLabOS = () => {
    // TODO: Implement sync from Lab OS
    console.log("Syncing from Lab OS...");
  };

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experiments</h1>
          <p className="text-sm text-muted-foreground">
            Manage your laboratory experiments and runs
          </p>
        </div>
        <Button onClick={handleSyncFromLabOS} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync from Lab OS
        </Button>
      </div>

      <DataTable table={table} onRowClick={handleRowClick}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
