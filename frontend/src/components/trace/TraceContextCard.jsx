import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

function toLabel(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "-";
  }
  return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export const TraceContextCard = ({ filter, context }) => {
  const safeContext = context || {};

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Trace Context</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-muted-foreground">Filter Type</p>
            <p className="font-medium">{toLabel(filter?.type)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Value</p>
            <p className="font-medium break-all">{filter?.value || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Known Status</p>
            <p className="font-medium">{toLabel(safeContext.lastStatus)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Known Location</p>
            <p className="font-medium break-words">{safeContext.lastLocation || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Event Timestamp</p>
            <p className="font-medium">{formatDateTime(safeContext.lastEventAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
