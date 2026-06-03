import { Link } from "@tanstack/react-router";
import { Button } from "@adaptyv-coordination/ui/components/button";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import {
  ArrowRight,
  CalendarDays,
  FlaskConical,
  MessageSquareQuote,
  Sparkles,
  Ticket,
  Workflow,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";

import {
  usePlanningTasks,
  usePlanningTickets,
  usePlanningWorkUnits,
} from "@/stores/usePlanningStore";
import { useExperimentCount } from "@/stores/usePrototypeStore";

const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

const WORKFLOW_STEPS = [
  {
    icon: MessageSquareQuote,
    title: "Client request",
    description: "Incoming work from R&D and production clients lands as experiments and runs.",
  },
  {
    icon: FlaskConical,
    title: "Configure & prioritize",
    description: "Scope protocols, attach context, and align deadlines before anything hits the bench.",
  },
  {
    icon: CalendarDays,
    title: "Plan the lab day",
    description: "Batch ready work, assign technicians, and schedule tickets on the planning board.",
  },
  {
    icon: Ticket,
    title: "Execute in LabOS",
    description: "Approved units become concrete tasks in LabOS — clear handoff from planning to execution.",
  },
] as const;

type WorkspaceLink = {
  to: "/experiments" | "/planning" | "/tickets";
  label: string;
  description: string;
  icon: LucideIcon;
  stat: string;
  cta: string;
};

const WORKSPACE_LINKS: WorkspaceLink[] = [
  {
    to: "/experiments",
    label: "Experiments",
    description:
      "Browse client projects, open run revisions, and scaffold task chains from workflow templates.",
    icon: FlaskConical,
    stat: "experiments",
    cta: "Open experiments",
  },
  {
    to: "/planning",
    label: "Planning",
    description:
      "Queue batchable work, build units, resolve blockers, and schedule the daily kanban roster.",
    icon: CalendarDays,
    stat: "planning",
    cta: "Open planning board",
  },
  {
    to: "/tickets",
    label: "Tasks",
    description:
      "See what each technician runs today — track sent tickets and execution progress toward LabOS.",
    icon: Ticket,
    stat: "tickets",
    cta: "View daily tasks",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT_QUINT },
  },
};

function useHomeStats() {
  const experimentCount = useExperimentCount();
  const tasks = usePlanningTasks();
  const workUnits = usePlanningWorkUnits();
  const tickets = usePlanningTickets();

  return {
    experiments: experimentCount,
    planning: `${tasks.length} tasks · ${workUnits.length} units`,
    tickets: `${tickets.length} scheduled`,
  };
}

function WorkflowStep({
  step,
  index,
  isLast,
}: {
  step: (typeof WORKFLOW_STEPS)[number];
  index: number;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <li className="relative flex gap-3 sm:flex-1 sm:flex-col sm:items-center sm:text-center">
      {!isLast ? (
        <span
          aria-hidden
          className="absolute left-[15px] top-9 bottom-0 w-px bg-border/80 sm:left-[calc(50%+20px)] sm:top-5 sm:h-px sm:w-[calc(100%-40px)] sm:translate-x-0"
        />
      ) : null}
      <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-sm">
        <Icon className="size-4" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 pb-6 sm:pb-0">
        <p className="text-xs font-medium text-foreground">{step.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
      </div>
      <span className="sr-only">Step {index + 1} of {WORKFLOW_STEPS.length}</span>
    </li>
  );
}

function WorkspaceCard({
  link,
  statLabel,
  reduceMotion,
  index,
}: {
  link: WorkspaceLink;
  statLabel: string;
  reduceMotion: boolean;
  index: number;
}) {
  const Icon = link.icon;

  return (
    <motion.article
      variants={reduceMotion ? undefined : itemVariants}
      className="group relative"
    >
      <Link
        to={link.to}
        className={cn(
          "flex h-full flex-col rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm outline-none transition-[border-color,box-shadow,transform] duration-200",
          "hover:border-primary/35 hover:shadow-md hover:shadow-primary/5",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
          !reduceMotion && "hover:-translate-y-0.5",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary transition-colors duration-200 group-hover:bg-primary/18">
            <Icon className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <span className="rounded-md border border-border/50 bg-muted/40 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
            {statLabel}
          </span>
        </div>
        <h3 className="mt-4 text-sm font-semibold tracking-tight text-foreground">
          {link.label}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {link.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-[gap] duration-200 group-hover:gap-2">
          {link.cta}
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </Link>
      <span className="sr-only">Card {index + 1}</span>
    </motion.article>
  );
}

export function HomeScreen() {
  const reduceMotion = useReducedMotion();
  const stats = useHomeStats();

  const statByKey: Record<string, string> = {
    experiments: `${stats.experiments} in workspace`,
    planning: stats.planning,
    tickets: stats.tickets,
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT_QUINT }}
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-card to-card px-6 py-8 shadow-sm sm:px-8 sm:py-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-widest text-primary/90">
                Adaptyv coordination
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Welcome — let&apos;s get the lab organized
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                This workspace streamlines how we move from a{" "}
                <span className="font-medium text-foreground">client request</span> to{" "}
                <span className="font-medium text-foreground">tasks in LabOS</span>. Coordinate
                experiments, plan bench work, and hand off execution without losing context along
                the way.
              </p>
            </div>
          </div>
        </motion.header>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT_QUINT, delay: 0.1 }}
          className="mt-10"
          aria-labelledby="how-it-works-heading"
        >
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-muted-foreground" aria-hidden />
            <h2
              id="how-it-works-heading"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              How it fits together
            </h2>
          </div>
          <ol className="mt-4 flex flex-col gap-0 sm:flex-row sm:gap-3">
            {WORKFLOW_STEPS.map((step, index) => (
              <WorkflowStep
                key={step.title}
                step={step}
                index={index}
                isLast={index === WORKFLOW_STEPS.length - 1}
              />
            ))}
          </ol>
        </motion.section>

        <motion.section
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          className="mt-12"
          aria-labelledby="workspace-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="workspace-heading"
                className="text-sm font-semibold tracking-tight text-foreground"
              >
                Open a workspace
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick up where your team left off — prototype data is loaded for demos.
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link to="/planning" />}>
              Jump to planning
              <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORKSPACE_LINKS.map((link, index) => (
              <WorkspaceCard
                key={link.to}
                link={link}
                statLabel={statByKey[link.stat] ?? ""}
                reduceMotion={reduceMotion ?? false}
                index={index}
              />
            ))}
          </div>
        </motion.section>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="mt-10 text-center text-xs text-muted-foreground"
        >
          Prototype build — data resets from the controls in the corner when you need a fresh demo.
        </motion.p>
      </div>
    </div>
  );
}
