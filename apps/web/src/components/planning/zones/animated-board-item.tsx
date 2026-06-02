import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

type AnimatedBoardItemProps = {
  id: string;
  layoutId?: string;
  children: ReactNode;
  className?: string;
};

export function AnimatedBoardItem({
  id,
  layoutId,
  children,
  className,
}: AnimatedBoardItemProps) {
  return (
    <motion.div
      key={id}
      layout="position"
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", bounce: 0.12, duration: 0.35 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type AnimatedBoardListProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedBoardList({ children, className }: AnimatedBoardListProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <div className={className}>{children}</div>
    </AnimatePresence>
  );
}
