// context/LoadingContext.tsx
'use client'

import { createContext, useState, useContext, ReactNode } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

type LoadingProviderProps = {
  children: ReactNode;
};

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm dark:bg-gray-900 dark:bg-opacity-90">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Animated spinner */}
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/50"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent dark:border-t-blue-500 dark:border-r-blue-500"></div>
              
              {/* Mini version of the logo inside spinner */}
              <div className="absolute inset-2 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}