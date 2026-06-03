import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

export type ContentSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Top divider before this block (off for the first block under a card header). */
  divided?: boolean;
};

export function ContentSection({
  title,
  description,
  children,
  className,
  divided = true,
}: ContentSectionProps) {
  return (
    <section
      className={cn(divided && "border-t border-border/50 pt-4", className)}
    >
      {title ? (
        <div className="mb-3">
          <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </h4>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
