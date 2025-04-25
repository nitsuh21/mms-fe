"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { FiArrowLeft, FiUserPlus, FiLink } from "react-icons/fi";
import { Button, Card, Badge, Tabs, TabsContent, TabsList, TabsTrigger, ButtonGroup } from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { JoinCampaignModal, AddMarketerModal } from "@/components/affiliates";
import { affiliateService, Campaign, LeaderboardEntry } from "@/services/affiliateService";
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

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isAddMarketerModalOpen, setIsAddMarketerModalOpen] = useState(false);

  const { data: campaign, isLoading: isCampaignLoading } = useQuery<Campaign>({
    queryKey: ["campaign", campaignId],
    queryFn: () => affiliateService.getCampaign(Number(campaignId)),
  });

  const queryClient = useQueryClient();

  const { data: leaderboard, isLoading: isLeaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", campaignId],
    queryFn: () => affiliateService.getCampaignLeaderboard(Number(campaignId)),
  });

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
              onClick={() => setIsJoinModalOpen(true)}
            >
              <FiLink className="mr-2 h-4 w-4" />
              Join Campaign
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddMarketerModalOpen(true)}
            >
              <FiUserPlus className="mr-2 h-4 w-4" />
              Add Marketer
            </Button>
            
          <Link href={`/merchant-portal/${merchantId}/businesses/${businessId}/affiliates`}>
            <Button variant="outline">
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
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.total_participants || 0}</p>
              <p className="text-xs text-gray-500">Participants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.total_activities || 0}</p>
              <p className="text-xs text-gray-500">Activities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{campaign.total_rewards || 0}</p>
              <p className="text-xs text-gray-500">Rewards</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="leaderboard">
          <TabsList>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card className="p-6">
              {isLeaderboardLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.participant.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <span className="w-8 text-lg font-semibold">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{entry.participant.username}</p>
                          <p className="text-sm text-gray-500">{entry.participant.affiliate_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{entry.total_points} points</p>
                        <p className="text-sm text-gray-500">{entry.total_reward_amount} Birr</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No participants yet</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card className="p-6">
              <p className="text-center text-gray-500">Activity tracking coming soon</p>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card className="p-6">
              <p className="text-center text-gray-500">Rewards management coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <JoinCampaignModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => {
          setIsJoinModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["leaderboard", campaignId] });
        }}
        campaignId={Number(campaignId)}
      />

      <AddMarketerModal
        isOpen={isAddMarketerModalOpen}
        onClose={() => setIsAddMarketerModalOpen(false)}
        onSuccess={() => {
          setIsAddMarketerModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["leaderboard", campaignId] });
        }}
        campaignId={Number(campaignId)}
      />
    </div>
  );
}
