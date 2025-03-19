"use client";

import { FiDollarSign, FiUsers, FiCreditCard, FiAlertCircle } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data - replace with real data from your API
const stats = [
  {
    title: "Total Revenue",
    value: "$12,426",
    change: "+14.5%",
    icon: FiDollarSign,
    trend: "up",
  },
  {
    title: "Active Users",
    value: "2,128",
    change: "+7.2%",
    icon: FiUsers,
    trend: "up",
  },
  {
    title: "Active Subscriptions",
    value: "1,433",
    change: "+4.3%",
    icon: FiCreditCard,
    trend: "up",
  },
  {
    title: "Expiring Soon",
    value: "23",
    change: "Next 7 days",
    icon: FiAlertCircle,
    trend: "neutral",
  },
];

const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 2000 },
  { month: "Apr", revenue: 2780 },
  { month: "May", revenue: 1890 },
  { month: "Jun", revenue: 2390 },
];

const DashboardPage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
          Overview of your business metrics and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-muted">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-dark-text">
                    {stat.value}
                  </p>
                </div>
                <div className="rounded-full bg-brand-50 p-3 dark:bg-brand-900/20">
                  <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
              </div>
              <p
                className={`mt-4 text-sm font-medium ${
                  stat.trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : stat.trend === "down"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-dark-muted"
                }`}
              >
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card">
        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-dark-text">
          Revenue Overview
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#e2e8f0"
                }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
