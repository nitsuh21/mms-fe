"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Modal } from "@/components/ui/modal";
import ExampleFormOne from "@/components/form/example-form/ExampleFormOne";
import Button from "@/components/ui/button/Button";

const MembersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Members
        </h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2.5"
        >
          <FiPlus className="h-5 w-5" />
          Add Member
        </Button>
      </div>

      <ComponentCard title="All Members">
        <BasicTableOne />
      </ComponentCard>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
          Add New Member
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
            Save Member
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default MembersPage;
