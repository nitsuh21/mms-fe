import React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className="space-y-4">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab,
            setActiveTab,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

export function TabsList({ children, activeTab, setActiveTab }: TabsListProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              activeTab,
              setActiveTab,
            });
          }
          return child;
        })}
      </nav>
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

export function TabsTrigger({
  value,
  children,
  activeTab,
  setActiveTab,
}: TabsTriggerProps) {
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={cn(
        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
        isActive
          ? "border-brand-500 text-brand-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
}

export function TabsContent({ value, children, activeTab }: TabsContentProps) {
  if (activeTab !== value) return null;

  return <div className="mt-4">{children}</div>;
}
