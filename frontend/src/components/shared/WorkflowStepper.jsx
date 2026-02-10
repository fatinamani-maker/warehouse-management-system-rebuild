import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
export const WorkflowStepper = ({ steps }) => (<div className="flex items-center gap-0">
    {steps.map((step, i) => (<div key={i} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={cn("flex items-center justify-center h-7 w-7 rounded-full border-2", step.status === "completed" ? "bg-emerald-100 border-emerald-500 text-emerald-600" :
            step.status === "current" ? "bg-primary/10 border-primary text-primary" :
                "bg-muted border-muted-foreground/30 text-muted-foreground")}>
            {step.status === "completed" ? <CheckCircle2 className="h-4 w-4"/> :
            step.status === "current" ? <Clock className="h-3.5 w-3.5"/> :
                <Circle className="h-3 w-3"/>}
          </div>
          <span className={cn("text-[10px] mt-1 text-center w-16 leading-tight", step.status === "current" ? "font-semibold text-primary" : "text-muted-foreground")}>{step.label}</span>
        </div>
        {i < steps.length - 1 && (<div className={cn("h-0.5 w-8 mx-0.5 mt-[-14px]", step.status === "completed" ? "bg-emerald-400" : "bg-muted-foreground/20")}/>)}
      </div>))}
  </div>);
