import api from './api'
import type { TeamMember } from '@/types/team'

export const teamService = {
    getBusinessMembers: async (businessId: number): Promise<TeamMember[]> => {
        const response = await api.get(`/businesses/${businessId}/members/`);
        return response.data;
    },

    addBusinessMember: async (
        businessId: number,
        email: string,
        role: 'owner' | 'manager' | 'staff'
    ): Promise<TeamMember> => {
        const response = await api.post(`/businesses/${businessId}/members/`, {
            email,
            role
        });
        return response.data;
    },

    updateBusinessMember: async (
        businessId: number,
        memberId: number,
        role: 'owner' | 'manager' | 'staff',
        isActive: boolean
    ): Promise<TeamMember> => {
        const response = await api.patch(`/businesses/${businessId}/members/${memberId}/`, {
            role,
            is_active: isActive
        });
        return response.data;
    },

    removeBusinessMember: async (businessId: number, memberId: number): Promise<void> => {
        await api.delete(`/businesses/${businessId}/members/${memberId}/`);
    }
};