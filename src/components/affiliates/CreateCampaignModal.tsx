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
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["PRODUCT", "SERVICE", "EVENT", "OTHER"]),
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
}: CreateCampaignModalProps) {
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
      page_visit_points: 1,
      call_click_points: 2,
      social_click_points: 1,
      point_value: 10,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
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
      reset();
      onSuccess();
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
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold">
              Create New Campaign
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input {...register("name")} />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea {...register("description")} />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select {...register("category")}>
                  <option value="SOCIALMEDIA">Social Media</option>
                  <option value="EVENT">Event</option>
                  <option value="DIRECT">Direct Marketing</option>
                  <option value="OTHER">Other</option>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Input type="datetime-local" {...register("start_date")} />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Input type="datetime-local" {...register("end_date")} />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Page Visit Points
                  </label>
                  <Input
                    type="number"
                    {...register("page_visit_points", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Call Click Points
                  </label>
                  <Input
                    type="number"
                    {...register("call_click_points", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Social Click Points
                  </label>
                  <Input
                    type="number"
                    {...register("social_click_points", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Point Value (Birr)
                  </label>
                  <Input
                    type="number"
                    {...register("point_value", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
