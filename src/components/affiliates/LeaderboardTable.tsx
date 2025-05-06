import { LeaderboardEntry, affiliateService } from "@/services/affiliateService";
import { Button } from "@/components/ui";
import { useState } from "react";
import { format } from "date-fns";
import { FiChevronLeft, FiChevronRight, FiGift, FiXCircle, FiAward } from "react-icons/fi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  campaignId: number;
}

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: LeaderboardEntry;
  campaignId: number;
  onSuccess: () => void;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function RewardModal({ isOpen, onClose, entry, campaignId, onSuccess }: RewardModalProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await affiliateService.createReward({
        participant: entry.participant.id,
        campaign: campaignId,
        reward_amount: parseFloat(amount),
        total_points: entry.total_points
      });
      toast.success('Reward created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create reward:', error);
      toast.error('Failed to create reward');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Reward for {entry.participant.username}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Points Earned</label>
              <input 
                type="text" 
                value={entry.total_points} 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reward Amount ( From Points : {entry.total_reward_amount})</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter reward amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!amount || isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Reward'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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

export function LeaderboardTable({ entries, campaignId }: LeaderboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(entries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = entries.slice(startIndex, startIndex + itemsPerPage);

  const handleReward = (entry: LeaderboardEntry) => {
    setSelectedEntry(entry);
    setIsRewardModalOpen(true);
  };

  const handleRevokeClick = (entry: LeaderboardEntry) => {
    setSelectedEntry(entry);
    setIsRevokeModalOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedEntry?.reward_id) return;

    try {
      await affiliateService.revokeReward(selectedEntry.reward_id);
      queryClient.invalidateQueries({ queryKey: ["leaderboard", campaignId] });
      toast.success('Reward revoked successfully');
      setIsRevokeModalOpen(false);
    } catch (error: any) {
      console.error('Failed to revoke reward:', error);
      // Show the backend error message and close the modal
      toast.error(error?.response?.data?.error || 'Failed to revoke reward');
      setIsRevokeModalOpen(false);
    }
  };

  const handleRewardSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["leaderboard", campaignId] });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activities
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEntries.map((entry, index) => (
              <tr key={entry.participant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{startIndex + index + 1}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{entry.participant.username}</div>
                    <div className="text-sm text-gray-500">{entry.participant.full_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.total_points}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.activities_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    {entry.has_active_reward ? (
                      <Button
                        variant="danger"
                        className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                        onClick={() => handleRevokeClick(entry)}
                        disabled={entry.reward_status === 'PAID'}
                      >
                        <FiXCircle className="w-4 h-4" />
                        {entry.reward_status === 'PAID' ? 'Paid' : 'Revoke Reward'}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                        onClick={() => handleReward(entry)}
                      >
                        <FiAward className="w-4 h-4" />
                        Give Reward
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
      {selectedEntry && (
        <>
          <RewardModal
            isOpen={isRewardModalOpen}
            onClose={() => setIsRewardModalOpen(false)}
            entry={selectedEntry}
            campaignId={campaignId}
            onSuccess={handleRewardSuccess}
          />
          <Dialog open={isRevokeModalOpen} onOpenChange={setIsRevokeModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Revoke Reward</DialogTitle>
                <div className="text-sm text-gray-500 mt-2">
                  Are you sure you want to revoke this reward? This action cannot be undone.
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRevokeModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleRevokeConfirm}>
                  Revoke
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
