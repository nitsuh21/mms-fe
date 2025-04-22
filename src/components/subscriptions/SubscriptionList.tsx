'use client';

import React, { useState } from 'react';
import { Subscription } from '@/services/subscriptionService';
import { SubscriptionDetails } from './SubscriptionDetails';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { CreateSubscriptionModal } from './CreateSubscriptionModal';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onUpdate: () => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onUpdate,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.customer.first_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.customer.last_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscription.plan.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || subscription.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscriptions
        </h2>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <FiPlus />
          <span>New Subscription</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full"
        >
          <option value="all">All Status</option>
          <option value="AC">Active</option>
          <option value="TR">Trial</option>
          <option value="PD">Past Due</option>
          <option value="CN">Cancelled</option>
          <option value="EX">Expired</option>
          <option value="PE">Pending</option>
        </Select>
      </div>

      {/* Subscription List */}
      <div className="space-y-6">
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No subscriptions found
            </p>
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <SubscriptionDetails
              key={subscription.id}
              subscription={subscription}
              onUpdate={onUpdate}
            />
          ))
        )}
      </div>

      {/* Create Subscription Modal */}
      <CreateSubscriptionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          onUpdate();
        }}
      />
    </div>
  );
};

export default SubscriptionList;
