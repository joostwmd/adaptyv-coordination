import { Checkbox } from "@adaptyv-coordination/ui/components/checkbox";
import { Input } from "@adaptyv-coordination/ui/components/input";
import { Label } from "@adaptyv-coordination/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adaptyv-coordination/ui/components/select";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { ParamField } from "@/domain/task-template/types";

type RunCreationParamFieldProps = {
  field: ParamField;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function RunCreationParamField({
  field,
  value,
  onChange,
}: RunCreationParamFieldProps) {
  const label = field.title ?? field.name;
  const id = `run-param-${field.name}`;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
        {field.unit ? ` (${field.unit})` : ""}
        {field.required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </Label>

      {field.type === "boolean" ? (
        <div className="flex h-8 items-center gap-2">
          <Checkbox
            id={id}
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
          <span className="text-sm text-foreground">{value === true ? "Yes" : "No"}</span>
        </div>
      ) : field.type === "select" && field.options?.length ? (
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={(next) => onChange(next)}
        >
          <SelectTrigger id={id} className="h-8 w-full">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "number" ? (
        <Input
          id={id}
          type="number"
          className="h-8"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? null : Number(raw));
          }}
        />
      ) : (
        <Input
          id={id}
          className="h-8"
          value={typeof value === "string" ? value : value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.description ? (
        <p className={cn("text-[11px] text-muted-foreground")}>{field.description}</p>
      ) : null}
    </div>
  );
}
