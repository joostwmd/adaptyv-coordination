import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import {
  CalendarDays,
  FlaskConical,
  Ticket,
  type LucideIcon,
} from "lucide-react";

import { ModeToggle } from "./mode-toggle";

type NavTab = {
  to: "/experiments" | "/tickets" | "/planning";
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

const NAV_TABS: NavTab[] = [
  {
    to: "/experiments",
    label: "Experiments",
    icon: FlaskConical,
    match: (pathname) =>
      pathname === "/experiments" || pathname.startsWith("/experiments/"),
  },
  {
    to: "/tickets",
    label: "Tasks",
    icon: Ticket,
    match: (pathname) => pathname === "/tickets" || pathname.startsWith("/tickets/"),
  },
  {
    to: "/planning",
    label: "Planning",
    icon: CalendarDays,
    match: (pathname) => pathname === "/planning" || pathname.startsWith("/planning/"),
  },
];

export default function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Home"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-transform group-hover:scale-[1.02]">
              A
            </span>
          </Link>

          <nav
            className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/50 p-0.5"
            aria-label="Main"
          >
            {NAV_TABS.map(({ to, label, icon: Icon, match }) => {
              const isActive = match(pathname);

              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                    isActive
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={2} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
