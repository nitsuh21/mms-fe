import { CampaignActivity } from "@/services/affiliateService";
import { Button } from "@/components/ui";
import { useState } from "react";
import { format } from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ActivitiesTableProps {
  activities: CampaignActivity[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 text-primary hover:bg-primary/10 disabled:opacity-50"
        >
          <FiChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 text-primary hover:bg-primary/10 disabled:opacity-50"
        >
          Next
          <FiChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="inline-flex gap-2" aria-label="Pagination">
            <Button
              variant="outline"
              className="flex items-center gap-1 hover:bg-primary hover:text-white transition-colors"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1 hover:bg-primary hover:text-white transition-colors"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <FiChevronRight className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}

const activityTypeLabels = {
  PAGE_VISIT: 'Page Visit',
  CALL_CLICK: 'Call Click',
  SOCIAL_CLICK: 'Social Click'
};

export function ActivitiesTable({ activities }: ActivitiesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(activities.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = activities.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points Earned
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedActivities.map((activity) => (
              <tr key={`${activity.participant.id}-${activity.timestamp}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{activity.participant.username}</div>
                    <div className="text-sm text-gray-500">{activity.participant.full_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {activityTypeLabels[activity.activity_type as keyof typeof activityTypeLabels]}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{activity.points_earned}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
