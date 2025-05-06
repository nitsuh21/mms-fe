import { CampaignReward, affiliateService } from "@/services/affiliateService";
import { Button } from "@/components/ui";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FiChevronLeft, FiChevronRight, FiCheck, FiDollarSign } from "react-icons/fi";

interface RewardsTableProps {
  rewards: CampaignReward[];
  onStatusChange: () => void;
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

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  PAID: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function RewardsTable({ rewards, onStatusChange }: RewardsTableProps) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(rewards.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRewards = rewards.slice(startIndex, startIndex + itemsPerPage);

  const handleApprove = async (rewardId: number) => {
    try {
      await affiliateService.approveReward(rewardId);
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      onStatusChange();
    } catch (error) {
      console.error('Failed to approve reward:', error);
    }
  };

  const handlePay = async (rewardId: number) => {
    try {
      await affiliateService.markRewardAsPaid(rewardId);
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      onStatusChange();
    } catch (error) {
      console.error('Failed to mark reward as paid:', error);
    }
  };

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
                Points
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRewards.map((reward) => (
              <tr key={reward.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{reward.participant}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{reward.total_points}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {reward.reward_amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'ETB'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reward.status]}`}>
                    {reward.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(new Date(reward.created_at), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {reward.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleApprove(reward.id)}
                      >
                        <FiCheck className="w-4 h-4" />
                        Approve
                      </Button>
                    )}
                    {reward.status === 'APPROVED' && (
                      <Button
                        variant="primary"
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => handlePay(reward.id)}
                      >
                        <FiDollarSign className="w-4 h-4" />
                        Mark as Paid
                      </Button>
                    )}
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
