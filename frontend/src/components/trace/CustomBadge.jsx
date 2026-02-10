import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const modeStyles = {
  global: "bg-slate-100 text-slate-700 border-slate-200",
  filtered: "bg-blue-100 text-blue-700 border-blue-200",
};

export const CustomBadge = ({ mode = "global", className }) => {
  const normalizedMode = String(mode || "global").toLowerCase() === "filtered" ? "filtered" : "global";

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] tracking-wide uppercase font-semibold", modeStyles[normalizedMode], className)}
    >
      {normalizedMode}
    </Badge>
  );
};
