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
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Team Management</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your platform team members and permissions
          </p>
        </div>

        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
          <FiPlus className="h-4 w-4" />
          Add Team Member
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-default dark:border-gray-700 dark:bg-gray-800">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-4 pr-10 outline-none focus:border-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-brand-500"
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

        {/* Desktop view - table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-6 border-b border-gray-200 py-4 px-6 dark:border-gray-700">
            <div className="col-span-2">
              <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Name / Email</h5>
            </div>
            <div className="col-span-1">
              <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Role</h5>
            </div>
            <div className="col-span-1">
              <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Status</h5>
            </div>
            <div className="col-span-1">
              <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Last Active</h5>
            </div>
            <div className="col-span-1">
              <h5 className="text-sm font-medium uppercase text-gray-700 dark:text-gray-300">Actions</h5>
            </div>
          </div>

          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => (
              <div
                key={`desktop-${member.id}`}
                className={`grid grid-cols-6 ${
                  index === filteredMembers.length - 1
                    ? ""
                    : "border-b border-gray-200 dark:border-gray-700"
                } py-4 px-6`}
              >
                <div className="col-span-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.email}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-gray-700 dark:text-gray-300">{member.role}</p>
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                      member.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                <div className="col-span-1">
                  <p className="text-gray-700 dark:text-gray-300">{member.lastActive}</p>
                </div>
                <div className="col-span-1 flex items-center gap-2">
                  <button className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
                    <FiMail className="text-lg" />
                  </button>
                  <button className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
                    <FiEdit className="text-lg" />
                  </button>
                  <button className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
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

        {/* Mobile view - cards */}
        <div className="md:hidden">
          {filteredMembers.length > 0 ? (
            <div className="space-y-4 p-4">
              {filteredMembers.map((member) => (
                <div 
                  key={`mobile-${member.id}`}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                        member.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                      <p className="text-gray-700 dark:text-gray-300">{member.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Active</p>
                      <p className="text-gray-700 dark:text-gray-300">{member.lastActive}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FiMail className="text-lg" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FiEdit className="text-lg" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No team members found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
