import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
export const ConfirmModal = ({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", cancelLabel = "Back", variant = "destructive" }) => (<Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {variant === "destructive" && <AlertTriangle className="h-5 w-5 text-destructive"/>}
          {title}
        </DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>);
