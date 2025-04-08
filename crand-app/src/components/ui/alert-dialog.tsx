"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

interface AlertDialogContentProps {
  children?: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

interface AlertDialogTitleProps {
  children?: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children?: React.ReactNode;
  className?: string;
}

interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

interface AlertDialogCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {children}
  </Dialog>
);

const AlertDialogTrigger = DialogTrigger;

const AlertDialogContent = ({
  children,
  className,
}: AlertDialogContentProps) => (
  <DialogContent className={className}>{children}</DialogContent>
);

const AlertDialogHeader = ({ children, className }: AlertDialogHeaderProps) => (
  <DialogHeader className={className}>{children}</DialogHeader>
);

const AlertDialogTitle = ({ children, className }: AlertDialogTitleProps) => (
  <DialogTitle className={className}>{children}</DialogTitle>
);

const AlertDialogDescription = ({
  children,
  className,
}: AlertDialogDescriptionProps) => (
  <DialogDescription className={className}>{children}</DialogDescription>
);

const AlertDialogFooter = ({ children, className }: AlertDialogFooterProps) => (
  <DialogFooter className={className}>{children}</DialogFooter>
);

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  AlertDialogActionProps
>(({ className, children, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants(), className)} {...props}>
    {children}
  </button>
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  AlertDialogCancelProps
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  >
    {children}
  </button>
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};
