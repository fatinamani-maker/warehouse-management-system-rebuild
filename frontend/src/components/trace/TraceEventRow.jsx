import { Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString();
}

function toActorLabel(event) {
  const actorType = String(event?.actorType || "system").toLowerCase();
  if (actorType === "user") {
    return event?.actorName || event?.actorId || "Unknown User";
  }
  if (actorType === "device") {
    return event?.deviceCode || event?.actorId || "Unknown Device";
  }
  return event?.systemCode || event?.actorId || "System";
}

function toEventLabel(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "Unknown";
  }
  return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export const TraceEventRow = ({ event, isLatest, onSkuClick, onReferenceClick }) => {
  const referenceLabel = `${event.refType || "-"}${event.refNo ? ` ${event.refNo}` : ""}`;

  return (
    <div className="flex gap-3 rounded-md border bg-background px-3 py-3">
      <div className="flex flex-col items-center pt-1">
        <div className={cn("h-3 w-3 rounded-full border-2", isLatest ? "bg-primary border-primary" : "bg-muted border-muted-foreground/40")} />
        <div className="mt-1 h-full min-h-[28px] w-px bg-border" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <StatusBadge status={String(event.status || event.eventType || "unknown").toLowerCase()} />
          <span className="font-medium">{toEventLabel(event.eventType)}</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDateTime(event.eventAt)}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{event.process || "Trace"}</span>
          <span> · </span>
          <span>{event.locationPath || event.locationCode || "-"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Actor: <span className="font-medium text-foreground">{toActorLabel(event)}</span></span>
          <span>·</span>
          <span>Warehouse: <span className="font-medium text-foreground">{event.warehouseName || event.warehouseId || "-"}</span></span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">SKU:</span>
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => onSkuClick?.(event.sku)}
            disabled={!event.sku}
          >
            {event.sku || "-"}
          </button>

          <span className="text-muted-foreground">Ref:</span>
          <button
            type="button"
            className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            onClick={() => onReferenceClick?.({ type: event.refType, value: event.refNo })}
            disabled={!event.refNo}
          >
            {referenceLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
