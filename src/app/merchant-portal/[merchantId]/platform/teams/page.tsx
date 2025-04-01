'use client';

import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiMail } from "react-icons/fi";
import { useParams } from "next/navigation";
import { teamService } from "@/services/teamService";
import type { TeamMember } from "@/types/team";

export default function TeamsPage() {
  const { merchantId } = useParams() as { merchantId: string };
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
    role: "staff" as const
  });

  const loadBusinessMembers = async () => {
    try {
      const response = await teamService.getBusinessMembers(Number(merchantId));
      setMembers(response);
    } catch (error) {
      console.error("Failed to load business members:", error);
    }
  };

  useEffect(() => {
    loadBusinessMembers();
  }, []);

  const handleAddMember = async () => {
    try {
      await teamService.addBusinessMember(
        Number(merchantId),
        newMember.email,
        newMember.role
      );
      setShowAddMember(false);
      setNewMember({ email: "", role: "staff" });
      loadBusinessMembers();
    } catch (error) {
      console.error("Failed to add team member:", error);
    }
  };

  const handleUpdateMember = async (
    businessId: number,
    memberId: number,
    role: TeamMember["role"],
    isActive: boolean
  ) => {
    try {
      await teamService.updateBusinessMember(businessId, memberId, role, isActive);
      loadBusinessMembers();
    } catch (error) {
      console.error("Failed to update team member:", error);
    }
  };

  const handleRemoveMember = async (businessId: number, memberId: number) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      try {
        await teamService.removeBusinessMember(businessId, memberId);
        loadBusinessMembers();
      } catch (error) {
        console.error("Failed to remove team member:", error);
      }
    }
  };

  const filteredMembers = members.filter(member =>
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <FiPlus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {showAddMember && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Member</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value as typeof newMember.role })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setNewMember({ email: "", role: "staff" });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {member.user.first_name} {member.user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {member.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateMember(Number(merchantId), member.id, e.target.value as TeamMember["role"], member.is_active)}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={member.is_active}
                      onChange={(e) => handleUpdateMember(Number(merchantId), member.id, member.role, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRemoveMember(Number(merchantId), member.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
