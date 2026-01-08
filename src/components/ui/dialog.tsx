"use client";

import * as React from "react";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      <div 
        className="fixed inset-0 bg-black/50"
        aria-hidden="true"
      />
      <div 
        className="relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md ${className}`}
    >
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className = "" }: DialogHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h2>
  );
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className = "" }: DialogFooterProps) {
  return (
    <div className={`mt-6 flex justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}
