import { Layers, Copy, Check, Pencil, Trash2 } from "lucide-react";
import { Toggle } from "@/shared/components";

export function ComboCard({
  combo,
  copied,
  onCopy,
  onEdit,
  onDelete,
  roundRobinEnabled,
  onToggleRoundRobin,
}) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-3 group">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Layers className="size-[18px] text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <code className="block truncate font-mono text-sm font-medium">
              {combo.name}
            </code>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
              {combo.models.length === 0 ? (
                <span className="text-xs text-text-muted italic">
                  No models
                </span>
              ) : (
                combo.models.slice(0, 3).map((model, index) => (
                  <code
                    key={index}
                    className="max-w-full truncate rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px] text-text-muted dark:bg-white/5 sm:max-w-[220px]"
                  >
                    {model}
                  </code>
                ))
              )}
              {combo.models.length > 3 && (
                <span className="text-[10px] text-text-muted">
                  +{combo.models.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:shrink-0">
          <div className="flex items-center justify-between gap-1.5 rounded-lg bg-black/[0.02] px-2 py-1.5 dark:bg-white/[0.02] sm:justify-start sm:bg-transparent sm:px-0 sm:py-0 sm:dark:bg-transparent">
            <span className="text-xs text-text-muted font-medium">
              Round Robin
            </span>
            <Toggle
              size="sm"
              checked={roundRobinEnabled}
              onChange={onToggleRoundRobin}
            />
          </div>

          <div className="grid grid-cols-3 gap-1 sm:flex">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(combo.name, `combo-${combo.id}`);
              }}
              className="flex flex-col items-center rounded px-2 py-1 text-text-muted transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/5"
              title="Copy combo name"
            >
              {copied === `combo-${combo.id}` ? (
                <Check className="size-[18px]" />
              ) : (
                <Copy className="size-[18px]" />
              )}
              <span className="text-[10px] leading-tight">Copy</span>
            </button>
            <button
              onClick={onEdit}
              className="flex flex-col items-center rounded px-2 py-1 text-text-muted transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/5"
              title="Edit"
            >
              <Pencil className="size-[18px]" />
              <span className="text-[10px] leading-tight">Edit</span>
            </button>
            <button
              onClick={onDelete}
              className="flex flex-col items-center rounded px-2 py-1 text-red-500 transition-colors hover:bg-red-500/10"
              title="Delete"
            >
              <Trash2 className="size-[18px]" />
              <span className="text-[10px] leading-tight">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
