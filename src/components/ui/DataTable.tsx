"use client";

import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiSearch, FiFilter } from 'react-icons/fi';

interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  filterable?: boolean;
  itemsPerPage?: number;
}

export function DataTable<T extends Record<string, unknown>>(
  {
    data,
    columns,
    onRowClick,
    searchable = true,
    filterable = true,
    itemsPerPage = 10,
  }: DataTableProps<T>
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter data based on search query
  const filteredData = searchQuery
    ? data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        {searchable && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300"
            />
            <FiSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        {filterable && (
          <button
            onClick={() => {
              // Add filter logic here
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <FiFilter className="w-5 h-5" />
            Filter
          </button>
        )}
      </div>

      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (column.key === sortColumn) {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortColumn(column.key);
                    setSortDirection('asc');
                  }
                }}
              >
                {column.title}
                {sortColumn === column.key && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedData.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/10"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                >
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {paginatedData.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {currentPage * itemsPerPage - itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/10 disabled:opacity-50"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredData.length / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/10 disabled:opacity-50"
            >
              <FiChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
