"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiX } from "react-icons/fi";
import { Button, Input, Textarea, Select } from "@/components/ui";
import { affiliateService, Campaign } from "@/services/affiliateService";
import { useNotification } from "@/context/NotificationContext";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign?: Campaign;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["PRODUCT", "SERVICE", "EVENT", "OTHER"]),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  page_visit_points: z.number().min(0),
  call_click_points: z.number().min(0),
  social_click_points: z.number().min(0),
  point_value: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

export function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess,
  campaign: initialCampaign,
}: CreateCampaignModalProps & { campaign?: Campaign }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const { showNotification } = useNotification() as { showNotification: (notification: { type: string; title: string; message: string }) => void };
  const businessId = params?.businessId as string;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialCampaign?.name || '',
      description: initialCampaign?.description || '',
      category: initialCampaign?.category || 'PRODUCT',
      status: initialCampaign?.status || 'DRAFT',
      start_date: initialCampaign?.start_date || '',
      end_date: initialCampaign?.end_date || '',
      page_visit_points: initialCampaign?.page_visit_points || 0,
      call_click_points: initialCampaign?.call_click_points || 0,
      social_click_points: initialCampaign?.social_click_points || 0,
      point_value: initialCampaign?.point_value || 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      if (initialCampaign) {
        // Update existing campaign
        await affiliateService.updateCampaign(initialCampaign.id, {
          ...data,
          business: Number(businessId),
        });
        showNotification({
          type: "success",
          title: "Success",
          message: "Campaign updated successfully",
        });
      } else {
        // Create new campaign
        await affiliateService.createCampaign({
          ...data,
          business: Number(businessId),
          status: "DRAFT",
        });
        showNotification({
          type: "success",
          title: "Success",
          message: "Campaign created successfully",
        });
      }
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        message: "Failed to create campaign",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => {
        reset();
        onClose();
      }} 
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          className="mx-auto max-w-2xl w-full rounded-lg bg-white dark:bg-gray-800 p-6 border dark:border-gray-700 shadow-lg dark:shadow-gray-900/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold dark:text-gray-200">
              {initialCampaign ? "Edit Campaign" : "Create New Campaign"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                <Input
                  {...register('name')}
                  placeholder="Campaign name"

                  className={errors.name ? 'border-red-500 ' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                <Textarea
                  {...register('description')}
                  placeholder="Campaign description"
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
                <Select
                  {...register('category')}
                  className={errors.category ? 'border-red-500' : ''}
                >
                  <option value="PRODUCT">Product</option>
                  <option value="SERVICE">Service</option>
                  <option value="EVENT">Event</option>
                  <option value="OTHER">Other</option>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                <Select
                  {...register('status')}
                  className={errors.status ? 'border-red-500' : ''}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="ENDED">Ended</option>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Date</label>
                <Input
                  {...register('start_date')}
                  type="date"
                  className={errors.start_date ? 'border-red-500' : ''}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Date</label>
                <Input
                  {...register('end_date')}
                  type="date"
                  className={errors.end_date ? 'border-red-500' : ''}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Page Visit Points</label>
                <Input
                  {...register('page_visit_points', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className={errors.page_visit_points ? 'border-red-500' : ''}
                />
                {errors.page_visit_points && (
                  <p className="text-red-500 text-sm mt-1">{errors.page_visit_points.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Call Click Points</label>
                <Input
                  {...register('call_click_points', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className={errors.call_click_points ? 'border-red-500' : ''}
                />
                {errors.call_click_points && (
                  <p className="text-red-500 text-sm mt-1">{errors.call_click_points.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Social Click Points</label>
                <Input
                  {...register('social_click_points', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className={errors.social_click_points ? 'border-red-500' : ''}
                />
                {errors.social_click_points && (
                  <p className="text-red-500 text-sm mt-1">{errors.social_click_points.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Point Value</label>
                <Input
                  {...register('point_value', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className={errors.point_value ? 'border-red-500' : ''}
                />
                {errors.point_value && (
                  <p className="text-red-500 text-sm mt-1">{errors.point_value.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-6 border-t dark:border-gray-700">
              <Button
                type="button"
                className="bg-transparent text-red-600 font-semibold py-2 px-4 border border-red-600"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  reset();
                  onClose();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button className="bg-blue-600 text-white font-semibold py-2 px-4 border border-blue-500 hover:bg-blue-700 transition-colors" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (initialCampaign ? "Updating..." : "Creating...") : initialCampaign ? "Update Campaign" : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
