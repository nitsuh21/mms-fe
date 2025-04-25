"use client";

import { useQuery } from "@tanstack/react-query";
import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { affiliateService, Campaign } from "@/services/affiliateService";
import { useState } from "react";
import { useParams } from "next/navigation";
import { CreateCampaignModal, CampaignList } from "@/components/affiliates";

export default function AffiliatesPage() {
  const params = useParams();
  const businessId = params?.businessId as string;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: campaigns, isLoading, refetch } = useQuery<Campaign[]>({
    queryKey: ["campaigns", businessId],
    queryFn: () => affiliateService.getCampaigns(businessId),
  });

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Affiliate Campaigns"
        description="Manage your affiliate marketing campaigns"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <FiPlus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        }
      />

      <div className="mt-8">
        <CampaignList campaigns={campaigns || []} isLoading={isLoading} />
      </div>

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
