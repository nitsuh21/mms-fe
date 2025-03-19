import Image from "next/image";
import Link from "next/link";

const RecentMembers = () => {
  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      subscription: "Monthly",
      status: "Active",
      amount: "$29.99",
      nextPayment: "2025-04-19",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      subscription: "Yearly",
      status: "Active",
      amount: "$299.99",
      nextPayment: "2026-03-19",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      subscription: "Monthly",
      status: "Expiring",
      amount: "$29.99",
      nextPayment: "2025-03-25",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@example.com",
      subscription: "Lifetime",
      status: "Active",
      amount: "$999.99",
      nextPayment: "N/A",
    },
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6 flex justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Recent Members
        </h4>
        <Link
          href="/members"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All Members
        </Link>
      </div>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-6">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Name</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Subscription
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Status
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Amount
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Next Payment
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Actions
            </h5>
          </div>
        </div>

        {members.map((member, key) => (
          <div
            key={key}
            className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-6"
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-meta-2 p-2 dark:bg-meta-4">
                  <span className="text-black dark:text-white">
                    {member.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-black dark:text-white">
                  {member.name}
                </h5>
                <p className="text-sm">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{member.subscription}</p>
            </div>
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p
                className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                  member.status === "Active"
                    ? "bg-success text-success"
                    : "bg-danger text-danger"
                }`}
              >
                {member.status}
              </p>
            </div>
            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{member.amount}</p>
            </div>
            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{member.nextPayment}</p>
            </div>
            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <button className="hover:text-primary">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMembers;
