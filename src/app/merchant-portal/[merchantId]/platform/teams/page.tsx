"use client";

import { useState } from "react";
import { FiPlus, FiEdit, FiTrash2, FiMail } from "react-icons/fi";

// Mock data for team members
const mockTeamMembers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "Admin",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Manager",
    status: "active",
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "Support",
    status: "inactive",
    lastActive: "2 weeks ago",
  },
  {
    id: "4",
    name: "Emily Wilson",
    email: "emily.wilson@example.com",
    role: "Manager",
    status: "active",
    lastActive: "3 hours ago",
  },
  {
    id: "5",
    name: "David Lee",
    email: "david.lee@example.com",
    role: "Support",
    status: "active",
    lastActive: "Just now",
  },
];

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = mockTeamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Team Management</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage your platform team members and permissions
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
          <FiPlus className="h-4 w-4" />
          Add Team Member
        </button>
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-6 border-b border-stroke dark:border-strokedark">
          <div className="relative">
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-4 pr-10 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-4 top-2.5 text-gray-500 dark:text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 border-b border-stroke py-4 px-6 dark:border-strokedark">
          <div className="col-span-2">
            <h5 className="text-sm font-medium uppercase">Name / Email</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Role</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Status</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Last Active</h5>
          </div>
          <div className="col-span-1">
            <h5 className="text-sm font-medium uppercase">Actions</h5>
          </div>
        </div>

        {filteredMembers.length > 0 ? (
          filteredMembers.map((member, index) => (
            <div
              key={member.id}
              className={`grid grid-cols-6 ${
                index === filteredMembers.length - 1
                  ? ""
                  : "border-b border-stroke dark:border-strokedark"
              } py-4 px-6`}
            >
              <div className="col-span-2">
                <h5 className="font-medium text-black dark:text-white">
                  {member.name}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {member.email}
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-black dark:text-white">{member.role}</p>
              </div>
              <div className="col-span-1">
                <span
                  className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                    member.status === "active"
                      ? "bg-success bg-opacity-10 text-success"
                      : "bg-danger bg-opacity-10 text-danger"
                  }`}
                >
                  {member.status}
                </span>
              </div>
              <div className="col-span-1">
                <p className="text-black dark:text-white">{member.lastActive}</p>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <button className="hover:text-primary">
                  <FiMail className="text-lg" />
                </button>
                <button className="hover:text-primary">
                  <FiEdit className="text-lg" />
                </button>
                <button className="hover:text-danger">
                  <FiTrash2 className="text-lg" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No team members found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
