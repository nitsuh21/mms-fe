"use client";

import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import React from "react";

export default function ProfileClientWrapper() {
  return (
    <div className="space-y-6">
      <UserMetaCard />
      <UserInfoCard />
      <UserAddressCard />
    </div>
  );
}
