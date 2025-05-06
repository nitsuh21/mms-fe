import { AffiliateParticipant, affiliateService } from "@/services/affiliateService";
import { Button, Input } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FiCopy, FiMail, FiPhone, FiSearch, FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ParticipantsTableProps {
  participants: AffiliateParticipant[];
  onParticipantRemoved?: () => void;
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
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
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
          <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button
              variant="outline"
              className="rounded-l-md"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="rounded-r-md"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function ParticipantsTable({ participants, onParticipantRemoved }: ParticipantsTableProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<AffiliateParticipant | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const itemsPerPage = 10;

  const handleRemoveClick = (participant: AffiliateParticipant) => {
    setSelectedParticipant(participant);
    setIsRemoveModalOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedParticipant) return;

    try {
      await affiliateService.removeParticipant(selectedParticipant.id);
      toast.success('Participant removed successfully');
      setIsRemoveModalOpen(false);
      setSelectedParticipant(null);
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      onParticipantRemoved?.();
    } catch (error) {
      console.error('Failed to remove participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) =>
      participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [participants, searchQuery]);

  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParticipants = filteredParticipants.slice(startIndex, startIndex + itemsPerPage);
  return (
    <div className="relative">
      <div className="space-y-4">
      <div className="flex items-center px-4">
        <div className="relative w-full max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participant
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Affiliate ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedParticipants.map((participant) => (
            <tr key={participant.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{participant.username}</div>
                  <div className="text-sm text-gray-500">{participant.full_name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FiMail className="h-4 w-4" />
                    <span>{participant.email || '-'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FiPhone className="h-4 w-4" />
                    <span>{participant.phone}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{participant.affiliate_id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {format(new Date(participant.created_at), 'MMM d, yyyy')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-2">
                  <Button
                    className="text-sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/r/${participant.affiliate_id}`);
                      toast.success('Affiliate link copied to clipboard');
                    }}
                  >
                    <FiCopy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="danger"
                    className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                    onClick={() => handleRemoveClick(participant)}
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {filteredParticipants.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      </div>
      {selectedParticipant && (
      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Participant</DialogTitle>
            <div className="text-sm text-gray-500 mt-2">
              Are you sure you want to remove {selectedParticipant.username}? This will delete all their activities, rewards, and leaderboard entries. This action cannot be undone.
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRemoveConfirm}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
