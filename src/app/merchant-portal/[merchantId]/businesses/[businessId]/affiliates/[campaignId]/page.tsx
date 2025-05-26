"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { FiArrowLeft, FiEdit2, FiTrash2, FiActivity } from "react-icons/fi";
import { ParticipantsTable } from "@/components/affiliates/ParticipantsTable";
import { LeaderboardTable } from "@/components/affiliates/LeaderboardTable";
import { ActivitiesTable } from "@/components/affiliates/ActivitiesTable";
import { RewardsTable } from "@/components/affiliates/RewardsTable";
import { Button, Card, Badge, Tabs, TabsContent, TabsList, TabsTrigger, ButtonGroup } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CreateCampaignModal } from "@/components/affiliates/CreateCampaignModal";
import { PageHeader } from "@/components/shared";
import { AddMarketerModal } from "@/components/affiliates";
import { affiliateService, Campaign, LeaderboardEntry, CampaignReward, CampaignActivity } from "@/services/affiliateService";
import Link from "next/link";

const statusColors = {
  DRAFT: "bg-gray-500",
  ACTIVE: "bg-green-500",
  PAUSED: "bg-yellow-500",
  ENDED: "bg-red-500",
};

export default function CampaignDetailsPage() {
  const params = useParams();
  const merchantId = params?.merchantId as string;
  const businessId = params?.businessId as string;
  const campaignId = params?.campaignId as string;

  const [isAddMarketerModalOpen, setIsAddMarketerModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data: campaign, isLoading: isCampaignLoading } = useQuery<Campaign>({
    queryKey: ["campaign", campaignId],
    queryFn: () => affiliateService.getCampaign(Number(campaignId)),
  });

  const queryClient = useQueryClient();

  const { data: leaderboard, isLoading: isLeaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", campaignId],
    queryFn: () => affiliateService.getCampaignLeaderboard(Number(campaignId)),
  });

  const { data: activities, isLoading: isActivitiesLoading } = useQuery<CampaignActivity[]>({
    queryKey: ["activities", campaignId],
    queryFn: () => affiliateService.getCampaignActivities(Number(campaignId)),
  });

  const { data: rewards, isLoading: isRewardsLoading } = useQuery<CampaignReward[]>({
    queryKey: ["rewards", campaignId],
    queryFn: () => affiliateService.getRewards(Number(campaignId)),
  });

  const handleDeleteCampaign = useCallback(async () => {
    try {
      await affiliateService.deleteCampaign(Number(campaignId));
      console.log('Campaign deleted successfully');
      window.location.href = `/merchant-portal/${merchantId}/businesses/${businessId}/affiliates`;
    } catch {
      console.error('Failed to delete campaign');
    }
  }, [campaignId, merchantId, businessId]);

  if (isCampaignLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-gray-500">Campaign not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={campaign.name}
        description={campaign.description}
        action={
          <ButtonGroup>

            <Button
              variant="outline"
              className="h-8 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 transition-all duration-200 rounded-lg px-4"
              onClick={() => setIsEditModalOpen(true)}
            >
              <FiEdit2 className="mr-2 h-4 w-4" />
              Edit Campaign
            </Button>

            {/* <Dialog open={isEditModalOpen} onOpenChange={() => setIsEditModalOpen(false)}>
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogContent className="mx-auto max-w-2xl w-full rounded-lg bg-white dark:bg-gray-800 p-6 border dark:border-gray-700 shadow-lg dark:shadow-gray-900/50">
                  <CreateCampaignModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                      setIsEditModalOpen(false);
                      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
                    }}
                    campaign={campaign}
                  />
                </DialogContent>
              </div>
            </Dialog> */}

            <Button
              variant="danger"
              className="h-8 text-sm bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 transition-all duration-200 rounded-lg px-4"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            
            <Link href={`/merchant-portal/${merchantId}/businesses/${businessId}/affiliates`}>
              <Button 
                variant="outline"
                className="h-8 text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700 border-gray-200 hover:border-gray-300 transition-all duration-200 rounded-lg px-4"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaigns
              </Button>
            </Link>
          </ButtonGroup>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
          <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-sm">
              {format(new Date(campaign.start_date), "MMM d, yyyy")} -{" "}
              {format(new Date(campaign.end_date), "MMM d, yyyy")}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Point System</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Page Visit</span>
              <span className="font-medium">{campaign.page_visit_points} points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Call Click</span>
              <span className="font-medium">{campaign.call_click_points} points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Social Click</span>
              <span className="font-medium">{campaign.social_click_points} points</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm">Point Value</span>
              <span className="font-medium">{campaign.point_value} Birr</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Campaign Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.total_participants || 0}</p>
              <p className="text-xs text-gray-500">Participants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.total_activities || 0}</p>
              <p className="text-xs text-gray-500">Total Activities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.total_rewards || 0}</p>
              <p className="text-xs text-gray-500">Rewards Given</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.total_points || 0}</p>
              <p className="text-xs text-gray-500">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.page_visits || 0}</p>
              <p className="text-xs text-gray-500">Page Visits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.call_clicks || 0}</p>
              <p className="text-xs text-gray-500">Call Clicks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.social_clicks || 0}</p>
              <p className="text-xs text-gray-500">Social Clicks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{(campaign.total_rewards_amount || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Rewards (Cash)</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="participants">
          <TabsList>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card>
              {isLeaderboardLoading ? (
                <div className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <LeaderboardTable entries={leaderboard} campaignId={Number(campaignId)} />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No activities recorded yet
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Campaign Participants</h3>
                <Button
                  variant="outline"
                  className="h-8 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 transition-all duration-200 rounded-lg px-4"
                  onClick={() => setIsAddMarketerModalOpen(true)}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Participant
                  </span>
                </Button>
              </div>
              <div className="mt-4">
                {campaign.participants && campaign.participants.length > 0 ? (
                  <ParticipantsTable participants={campaign.participants} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No participants yet
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Campaign Activities</h3>
                  <div className="flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-500">{activities?.length || 0} activities</span>
                  </div>
                </div>
                {isActivitiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : activities && activities.length > 0 ? (
                  <ActivitiesTable activities={activities} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No activities recorded yet
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card>
              {isRewardsLoading ? (
                <div className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : rewards && rewards.length > 0 ? (
                <RewardsTable 
                  rewards={rewards} 
                  onStatusChange={() => queryClient.invalidateQueries({ queryKey: ["rewards", campaignId] })} 
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No rewards created yet
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>


      <CreateCampaignModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
        }}
        campaign={campaign}
      />

      {/* Delete Campaign Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Are you sure you want to delete this campaign? This action cannot be undone.
            All associated participants, activities, and rewards will be deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCampaign}>
              Delete Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Add MarketerModal*/}
      <AddMarketerModal
        isOpen={isAddMarketerModalOpen}
        onClose={() => setIsAddMarketerModalOpen(false)}
        onSuccess={() => {
          setIsAddMarketerModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
        }}
        campaignId={Number(campaignId)}
      />
    </div>
  );
}
