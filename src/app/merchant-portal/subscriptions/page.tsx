"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import ComponentCard from "@/components/common/ComponentCard";
import { Modal } from "@/components/ui/modal";
import ExampleFormOne from "@/components/form/example-form/ExampleFormOne";
import Button from "@/components/ui/button/Button";

const SubscriptionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Subscription Plans
        </h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2.5"
        >
          <FiPlus className="h-5 w-5" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <ComponentCard title="Basic Monthly">
          <div className="mb-6">
            <p className="font-medium">
              <span className="text-[28px] text-primary">$29.99</span>
              <span className="text-body-color dark:text-body-color-dark">
                /Monthly
              </span>
            </p>
          </div>

          <div className="mb-6">
            <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
              Features
            </h4>
            <ul className="flex flex-col gap-2">
              {["Basic Access", "Email Support", "1 Business"].map(
                (feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-body-color dark:text-body-color-dark">
                      {feature}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Pro Annual">
          <div className="mb-6">
            <p className="font-medium">
              <span className="text-[28px] text-primary">$299.99</span>
              <span className="text-body-color dark:text-body-color-dark">
                /Yearly
              </span>
            </p>
          </div>

          <div className="mb-6">
            <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
              Features
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                "Full Access",
                "Priority Support",
                "Multiple Businesses",
                "Analytics",
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-body-color dark:text-body-color-dark">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </div>
        </ComponentCard>

        <ComponentCard title="Lifetime">
          <div className="mb-6">
            <p className="font-medium">
              <span className="text-[28px] text-primary">$999.99</span>
              <span className="text-body-color dark:text-body-color-dark">
                /One-time
              </span>
            </p>
          </div>

          <div className="mb-6">
            <h4 className="mb-4 text-lg font-medium text-black dark:text-white">
              Features
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                "All Pro Features",
                "24/7 Support",
                "Unlimited Businesses",
                "Custom Analytics",
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span className="text-body-color dark:text-body-color-dark">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </div>
        </ComponentCard>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
          Create New Plan
        </h4>
        <ExampleFormOne />
        <div className="flex items-center justify-end w-full gap-3 mt-8">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              // Handle save logic here
              setIsModalOpen(false);
            }}
          >
            Save Plan
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SubscriptionsPage;
