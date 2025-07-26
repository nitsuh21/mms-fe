import React, { useState } from 'react';
import { FiTrash2, FiCheck, FiX } from 'react-icons/fi';

interface BulkActionsProps {
  selectedItems: (string | number)[];
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  itemName: string; // e.g., "members", "invoices", "subscriptions"
  isLoading?: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  onDeleteSelected,
  onClearSelection,
  itemName,
  isLoading = false
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDeleteSelected();
    setShowConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedItems.length} {itemName} selected
              </span>
            </div>
            <button
              onClick={onClearSelection}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDeleteClick}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <FiTrash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Delete {itemName}
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete {selectedItems.length} selected {itemName}? 
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions; 