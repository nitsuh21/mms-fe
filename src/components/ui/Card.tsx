import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white shadow-sm rounded-lg border border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
