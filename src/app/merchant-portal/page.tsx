import { Metadata } from "next";
import DashboardStats from "@/components/dashboard/DashboardStats";
import BusinessOverview from "@/components/dashboard/BusinessOverview";
import SubscriptionStats from "@/components/dashboard/SubscriptionStats";
import RecentMembers from "@/components/dashboard/RecentMembers";

export const metadata: Metadata = {
  title: "MMS Dashboard",
  description: "Manage your businesses and subscriptions",
};

export default function Dashboard() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <DashboardStats />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <BusinessOverview />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <SubscriptionStats />
        </div>
        <div className="col-span-12">
          <RecentMembers />
        </div>
      </div>
    </>
  );
}
