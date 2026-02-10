import { ConfirmModal } from "@/components/shared/ConfirmModal";

export const CustomConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
}) => {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant}
    />
  );
};
