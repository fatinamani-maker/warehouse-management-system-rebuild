import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CancellationConfirmModal({
  open,
  documentType,
  documentId,
  onClose,
  onConfirm,
  submitting = false,
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
      setTouched(false);
    }
  }, [open]);

  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length >= 5;
  const showValidation = touched && !isValid;
  const typeLabel = useMemo(() => String(documentType || "document").toUpperCase(), [documentType]);

  const handleConfirm = () => {
    setTouched(true);
    if (!isValid || submitting) {
      return;
    }
    onConfirm(trimmedReason);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !submitting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Cancellation</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this document?
            {documentId ? ` (${typeLabel} ${documentId})` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancel-reason">Cancellation Reason</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            onBlur={() => setTouched(true)}
            rows={4}
            placeholder="Please provide the reason for cancellation"
            disabled={submitting}
          />
          {showValidation && (
            <p className="text-xs text-destructive">Cancellation reason is required and must be at least 5 characters.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!isValid || submitting}>
            {submitting ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
