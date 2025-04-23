
import React from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteOrderDialogProps {
  order: Order | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteOrderDialog: React.FC<DeleteOrderDialogProps> = ({
  order,
  onClose,
  onConfirm,
}) => {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Izbriši naročilo</DialogTitle>
          <DialogDescription>
            Ali ste prepričani, da želite izbrisati naročilo #{order.id}?
            Tega dejanja ni mogoče razveljaviti.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Prekliči
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Izbriši naročilo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteOrderDialog;
