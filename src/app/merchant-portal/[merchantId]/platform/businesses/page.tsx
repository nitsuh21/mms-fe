"use client";

import { useParams } from "next/navigation";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { Business } from "@/types/business";
import AddBusinessForm from "@/components/form/AddBusinessForm";
import BusinessesTable from "@/components/tables/BusinessesTable";
import BusinessesCards from "@/components/cards/BusinessesCards";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Business[];
}

export default function PlatformBusinessesPage() {
  const params = useParams();
  const merchantId = params?.merchantId as string;
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get<PaginatedResponse>(`/businesses/businesses/`);
        setBusinesses(response.data.results);
        setError(null);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to fetch businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const handleDelete = async (businessId: string) => {
    setIsProcessing(true);
    try {
      await api.delete(`/businesses/businesses/${businessId}/`);
      setBusinesses(businesses.filter(b => b.id !== businessId));
    } catch (err) {
      console.error('Error deleting business:', err);
      throw err; // Let the table component handle the error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (businessId: string, isActive: boolean) => {
    setIsProcessing(true);
    try {
      await api.patch(`/businesses/businesses/${businessId}/`, { is_active: isActive });
      setBusinesses(businesses.map(b => 
        b.id === businessId ? { ...b, is_active: isActive } : b
      ));
    } catch (err) {
      console.error('Error updating business status:', err);
      throw err; // Let the table component handle the error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBusiness = async (formData: any) => {
    try {
      const response = await api.post('/businesses/businesses/', formData);
      setBusinesses([...businesses, response.data]);
      setIsAddFormOpen(false);
    } catch (err) {
      console.error('Error adding business:', err);
      throw err; // Let the form component handle the error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            <FiEdit2 className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!merchantId) {
    return null;
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Platform Businesses</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage all businesses across your platform
          </p>
        </div>

        <button
          onClick={() => setIsAddFormOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <FiPlus className="h-4 w-4" />
          Add Business
        </button>
      </div>

      <div className="hidden md:block">
        <BusinessesTable 
          businesses={businesses} 
          merchantId={merchantId} 
          onDelete={handleDelete}
          onToggleActiveStatus={handleToggleStatus}
        />
      </div>

      <BusinessesCards 
        businesses={businesses} 
        merchantId={merchantId} 
        onDeleteClick={(business) => handleDelete(business.id)}
      />

      <AddBusinessForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={handleAddBusiness}
      />
    </div>
  );
}