"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  loading: () => <div>Loading chart...</div>,
});

const BusinessOverview = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = {
    chart: {
      type: "area" as const,
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ["#3C50E0", "#80CAEE"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
    },
    xaxis: {
      type: "category" as const,
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
  };

  const series = [
    {
      name: "Active Members",
      data: [31, 40, 28, 51, 42, 109, 100, 120, 80, 95, 110, 140],
    },
    {
      name: "Revenue ($)",
      data: [11, 32, 45, 32, 34, 52, 41, 80, 96, 140, 150, 170],
    },
  ];

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Business Overview
          </h4>
        </div>
      </div>

      <div className="mb-2">
        <div id="businessOverview" className="-ml-5">
          {mounted && (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={350}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessOverview;
