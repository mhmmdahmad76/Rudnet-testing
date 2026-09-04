"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ModalAction {
  label: string;
  onClick: () => void;
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone: "neutral" | "danger";
  title: string;
  body: string;
  /** The reversible alternative — always first. */
  cancel: ModalAction;
  confirm: ModalAction;
  confirmLoading?: boolean;
}

/**
 * `danger` uses alert-dialog: it traps focus and cannot be dismissed by
 * clicking the scrim.
 */
function Modal({ open, onOpenChange, tone, title, body, cancel, confirm, confirmLoading }: ModalProps) {
  if (tone === "danger") {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel asChild>
              <Button variant="secondary" onClick={cancel.onClick}>
                {cancel.label}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="danger" onClick={confirm.onClick} loading={confirmLoading}>
                {confirm.label}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{body}</DialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={cancel.onClick}>
            {cancel.label}
          </Button>
          <Button variant="primary" onClick={confirm.onClick} loading={confirmLoading}>
            {confirm.label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { Modal };
