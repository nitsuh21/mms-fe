"use client";

import { useState } from "react";
import { FiChevronDown, FiPlus, FiSearch } from "react-icons/fi";
import Link from "next/link";

// Mock data - replace with real data from your API
const businesses = [
  { 
    id: "123",
    name: "Fitness Studio",
    type: "Gym",
    members: 245,
    status: "active" 
  },
  { 
    id: "456",
    name: "Yoga Center",
    type: "Wellness",
    members: 168,
    status: "active"
  },
  { 
    id: "789",
    name: "Dance Academy",
    type: "Studio",
    members: 92,
    status: "active"
  },
];

export const BusinessSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBusiness] = useState(businesses[0]);

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-sm hover:bg-gray-50 dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:hover:bg-dark-bg"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
          {getInitials(currentBusiness.name)}
        </span>
        <span className="max-w-[150px] truncate">{currentBusiness.name}</span>
        <FiChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-theme-lg dark:border-dark-border dark:bg-dark-card">
          {/* Search Box */}
          <div className="border-b border-gray-200 p-2 dark:border-dark-border">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder-dark-muted"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filteredBusinesses.map((business) => (
              <button
                key={business.id}
                onClick={() => {
                  // Handle business switch
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-dark-text dark:hover:bg-dark-bg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                    {getInitials(business.name)}
                  </span>
                  <div className="text-left">
                    <p className="font-medium">{business.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">
                      {business.type} • {business.members} members
                    </p>
                  </div>
                </div>
                {business.id === currentBusiness.id && (
                  <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                    Current
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200 p-2 dark:border-dark-border">
            <Link
              href="/merchant-portal/businesses/new"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-dark-text dark:hover:bg-dark-bg"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Business</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
