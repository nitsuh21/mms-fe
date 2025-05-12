"use client";

import { Campaign } from "@/services/affiliateService";
import { Badge, Card } from "@/components/ui";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

const statusColors = {
  DRAFT: "bg-gray-500",
  ACTIVE: "bg-green-500",
  PAUSED: "bg-yellow-500",
  ENDED: "bg-red-500",
};

export function CampaignList({ campaigns, isLoading }: CampaignListProps) {
  const params = useParams();
  const merchantId = params?.merchantId as string;
  const businessId = params?.businessId as string;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No campaigns found. Create your first campaign to get started.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <Link
          key={campaign.id}
          href={`/merchant-portal/${merchantId}/businesses/${businessId}/affiliates/${campaign.id}`}
          className="block"
        >
          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:dark:border-gray-600">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{campaign.name}</h3>
              <Badge className={cn(
                statusColors[campaign.status],
                "dark:text-white"
              )}>
                {campaign.status}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">{campaign.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(campaign.start_date), "MMM d, yyyy")} -{" "}
                {format(new Date(campaign.end_date), "MMM d, yyyy")}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.total_participants || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.total_activities || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Activities</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.total_rewards || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rewards</p>
              </div>
            </div>

            <div className="flex items-center justify-end text-brand-600 dark:text-brand-400 text-sm">
              View Details
              <FiArrowRight className="ml-2" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
