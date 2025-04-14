"use client";

import { useState } from 'react';
import { FiDownload, FiCalendar, FiFilter } from 'react-icons/fi';

// Mock data for reports
const mockReportTypes = [
  {
    id: "revenue",
    name: "Revenue Report",
    description: "Analyze revenue streams across all businesses",
    lastGenerated: "2025-03-15",
  },
  {
    id: "subscribers",
    name: "Subscribers Report",
    description: "Track subscriber growth and churn rates",
    lastGenerated: "2025-03-18",
  },
  {
    id: "businesses",
    name: "Business Performance",
    description: "Compare performance metrics across businesses",
    lastGenerated: "2025-03-10",
  },
  {
    id: "plans",
    name: "Plans Analysis",
    description: "Analyze subscription plan performance",
    lastGenerated: "2025-03-17",
  },
  {
    id: "marketing",
    name: "Marketing Effectiveness",
    description: "Measure marketing campaign results",
    lastGenerated: "2025-03-05",
  },
];

export default function PlatformReportsPage() {
  const [selectedReport, setSelectedReport] = useState("revenue");
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Platform Analytics</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Generate and view platform-wide analytics reports
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
            <FiDownload className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Report Types Sidebar */}
        <div className="col-span-1 md:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-default dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Report Types</h2>
            <div className="space-y-2">
              {mockReportTypes.map((report) => (
                <button
                  key={report.id}
                  className={`w-full rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-left transition-colors ${
                    selectedReport === report.id
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <h3 className="font-medium text-sm sm:text-base">{report.name}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {report.description}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <FiCalendar className="mr-1 h-3 w-3" />
                    Last generated: {report.lastGenerated}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="col-span-1 md:col-span-9">
          <div className="rounded-lg border border-gray-200 bg-white shadow-default dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {mockReportTypes.find((r) => r.id === selectedReport)?.name}
                </h2>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  <FiFilter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Report Visualization Placeholder */}
              <div className="mb-6 h-60 sm:h-80 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">
                  Report visualization will be displayed here
                </p>
              </div>

              {/* Report Data Table Placeholder */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <div className="min-w-full grid grid-cols-4 border-b border-gray-200 py-3 px-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="col-span-1 font-medium text-gray-900 dark:text-white text-sm">Category</div>
                  <div className="col-span-1 font-medium text-gray-900 dark:text-white text-sm">Value</div>
                  <div className="col-span-1 font-medium text-gray-900 dark:text-white text-sm">Change</div>
                  <div className="col-span-1 font-medium text-gray-900 dark:text-white text-sm">Trend</div>
                </div>
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Report data will be displayed here
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
