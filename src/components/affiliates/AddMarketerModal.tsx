"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiX } from "react-icons/fi";
import { Button, Input } from "@/components/ui";
import { affiliateService } from "@/services/affiliateService";
import { useNotification } from "@/context/NotificationContext";

interface AddMarketerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaignId: number;
}

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  full_name: z.string().min(6, "Full name must be at least 6 characters"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .regex(/^[0-9+]+$/, "Phone number must contain only digits and + symbol"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export function AddMarketerModal({
  isOpen,
  onClose,
  onSuccess,
  campaignId,
}: AddMarketerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await affiliateService.addMarketer({
        ...data,
        campaign_id: campaignId,
      });
      showNotification({
        type: "success",
        title: "Success",
        message: "Successfully added marketer to the campaign.",
      });
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      let errorMessage = "Failed to add participant. Please try again.";
      
      // Handle the specific case where participant already exists
      if (error.response?.data?.error === 'Participant already exists in this campaign') {
        errorMessage = error.response.data.detail || 'This participant is already registered in this campaign.';
      }
      
      showNotification({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-30"></div>
        
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Participants
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Username"
                {...register("username")}
                error={errors.username?.message}
              />
            </div>

            <div>
            <Input
                label="Full Name"
                {...register("full_name")}
                error={errors.full_name?.message}
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                {...register("phone")}
                error={errors.phone?.message}
              />
            </div>

            <div>
              <Input
                label="Email"
                type="email"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>


            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Participants"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
