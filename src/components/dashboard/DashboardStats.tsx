import { FiUsers, FiDollarSign, FiActivity, FiAlertCircle } from "react-icons/fi";

const DashboardStats = () => {
  const stats = [
    {
      title: "Total Members",
      value: "3,456",
      trend: "+2.5%",
      icon: <FiUsers className="text-primary" />,
    },
    {
      title: "Active Subscriptions",
      value: "2,890",
      trend: "+3.2%",
      icon: <FiActivity className="text-success" />,
    },
    {
      title: "Monthly Revenue",
      value: "$45,678",
      trend: "+4.1%",
      icon: <FiDollarSign className="text-warning" />,
    },
    {
      title: "Expiring Soon",
      value: "123",
      trend: "-1.5%",
      icon: <FiAlertCircle className="text-danger" />,
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            {stat.icon}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {stat.value}
              </h4>
              <span className="text-sm font-medium">{stat.title}</span>
            </div>

            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend.startsWith("+")
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};

export default DashboardStats;
