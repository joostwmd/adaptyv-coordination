type AnnotationBlockProps = {
  text: string;
  className?: string;
};

export function AnnotationBlock({ text, className }: AnnotationBlockProps) {
  if (!text.trim()) {
    return null;
  }

  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground">Why attached</p>
      <p className="mt-0.5 text-xs/relaxed">{text}</p>
    </div>
  );
}
