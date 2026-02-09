import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, Radio, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanEnabledFieldProps {
  value: string;
  onChange: (value: string) => void;
  onScan?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const ScanEnabledField = ({ value, onChange, onScan, placeholder = "Scan or type...", label, className }: ScanEnabledFieldProps) => {
  const [mode, setMode] = useState<"manual" | "qr" | "rfid">("manual");

  const handleSubmit = () => {
    if (value.trim() && onScan) onScan(value.trim());
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <div className="flex gap-1.5">
        <div className="flex border rounded-md overflow-hidden">
          <button onClick={() => setMode("manual")} className={cn("px-2 py-1.5 text-xs", mode === "manual" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")} title="Manual">
            <Keyboard className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setMode("qr")} className={cn("px-2 py-1.5 text-xs", mode === "qr" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")} title="QR Scan">
            <QrCode className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setMode("rfid")} className={cn("px-2 py-1.5 text-xs", mode === "rfid" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")} title="RFID">
            <Radio className="h-3.5 w-3.5" />
          </button>
        </div>
        <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-9 text-sm flex-1" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        <Button size="sm" onClick={handleSubmit} className="h-9">Scan</Button>
      </div>
      {mode !== "manual" && (
        <p className="text-[11px] text-muted-foreground">
          {mode === "qr" ? "📷 Camera / handheld QR scanner active (simulated)" : "📡 RFID reader listening (simulated)"}
        </p>
      )}
    </div>
  );
};
