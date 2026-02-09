import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  complete: "bg-blue-100 text-blue-700 border-blue-200",
  posted: "bg-violet-100 text-violet-700 border-violet-200",
  approved: "bg-violet-100 text-violet-700 border-violet-200",
  dispatched: "bg-violet-100 text-violet-700 border-violet-200",
  receiving: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  in_transit: "bg-amber-100 text-amber-700 border-amber-200",
  picking: "bg-amber-100 text-amber-700 border-amber-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  quarantine: "bg-orange-100 text-orange-700 border-orange-200",
  damaged: "bg-red-100 text-red-700 border-red-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  open: "bg-red-100 text-red-700 border-red-200",
  under_review: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  packed: "bg-blue-100 text-blue-700 border-blue-200",
  picked: "bg-blue-100 text-blue-700 border-blue-200",
  received: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  counted: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

export const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const style = statusStyles[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium border capitalize", style, className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
};
