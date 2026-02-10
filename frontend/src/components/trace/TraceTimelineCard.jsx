import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomBadge } from "@/components/trace/CustomBadge";
import { TraceEventRow } from "@/components/trace/TraceEventRow";

const pageSizeOptions = [10, 20, 50];

export const TraceTimelineCard = ({
  mode,
  events,
  loading,
  error,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onClearFilter,
  onSkuClick,
  onReferenceClick,
}) => {
  const isFiltered = mode === "filtered";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm">Trace Timeline</CardTitle>
          <div className="flex items-center gap-2">
            <CustomBadge mode={mode} />
            <Button variant="outline" size="sm" onClick={onClearFilter} disabled={!isFiltered || loading}>
              Clear Filter
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading && (
          <div className="rounded-md border px-4 py-6 text-sm text-muted-foreground">
            Loading trace timeline...
          </div>
        )}

        {!loading && events.length === 0 && isFiltered && (
          <div className="rounded-md border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            <p className="mb-3">No trace events found for this filter.</p>
            <Button size="sm" onClick={onClearFilter}>Clear Filter</Button>
          </div>
        )}

        {!loading && events.length === 0 && !isFiltered && (
          <div className="rounded-md border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            No trace events found for this tenant and warehouse scope.
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-2">
            {events.map((event, index) => (
              <TraceEventRow
                key={event.id || `${event.refNo || "trace"}-${index}`}
                event={event}
                isLatest={index === 0}
                onSkuClick={onSkuClick}
                onReferenceClick={onReferenceClick}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            {total} event{total === 1 ? "" : "s"} · Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange?.(Number(value))}
              disabled={loading}
            >
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" disabled={loading || page <= 1} onClick={() => onPageChange?.(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
