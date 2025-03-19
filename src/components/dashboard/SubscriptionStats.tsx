"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  loading: () => <div>Loading chart...</div>,
});

const SubscriptionStats = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = {
    chart: {
      type: "donut" as const,
    },
    colors: ["#3C50E0", "#10B981", "#FB5E5E", "#FBBF24"],
    labels: ["Monthly", "Yearly", "Lifetime", "Trial"],
    legend: {
      show: true,
      position: "bottom" as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

  const series = [44, 55, 13, 33];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Subscription Distribution
        </h4>
      </div>

      <div className="mb-2">
        <div id="subscriptionStats" className="mx-auto flex justify-center">
          {mounted && (
            <ReactApexChart
              options={options}
              series={series}
              type="donut"
              height={350}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-sm border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
            <h4 className="text-title-md font-bold text-black dark:text-white">
              2,890
            </h4>
            <span className="text-sm font-medium">Active Subscriptions</span>
          </div>
          <div className="rounded-sm border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
            <h4 className="text-title-md font-bold text-black dark:text-white">
              $45,678
            </h4>
            <span className="text-sm font-medium">Monthly Revenue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStats;
