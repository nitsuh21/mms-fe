"use client";

import { useState, useEffect, use, useCallback } from 'react';
import { Form, InputField, SelectField, SubmitButton, CheckboxField } from '@/components/ui/Form';
import { useNotification } from '@/context/NotificationContext';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { discountsService } from '@/services/discounts';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/DatePicker';
import BulkActions from '@/components/common/BulkActions';
import TableCheckbox from '@/components/common/TableCheckbox';

interface Discount {
  id: string;
  business: string;
  name: string;
  code: string;
  description: string;
  discount_type: 'P' | 'F';
  discount_value: string;
  discount_category: 'P' | 'D';
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans?: string[];
  max_uses: string;
  times_used: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AddDiscountParams {
  business: string;
  name: string;
  code: string;
  description: string;
  discount_type: 'P' | 'F';
  discount_value: string;
  discount_category: 'P' | 'D';
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans?: string[];
  max_uses: string;
  is_active: boolean;
}

interface UpdateDiscountParams {
  name: string;
  code: string;
  description: string;
  discount_type: 'P' | 'F';
  discount_value: string;
  discount_category: 'P' | 'D';
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans: string[];
  max_uses: string;
  business: string;
  is_active: boolean;
}

export default function DiscountsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = use(params);
  
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedDiscounts, setSelectedDiscounts] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const { addNotification } = useNotification();

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add form
  const addFormMethods = useForm<AddDiscountParams>({
    defaultValues: {
      business: businessId,
      name: '',
      code: '',
      description: '',
      discount_type: 'P',
      discount_value: '0',
      discount_category: 'P',
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      scope: 'A',
      specific_plans: [],
      max_uses: '1',
      is_active: false,
    },
  });

  // Edit form - create with proper default values when selectedDiscount is available
  const editFormMethods = useForm<UpdateDiscountParams>({
    defaultValues: {
      business: businessId,
      name: '',
      code: '',
      description: '',
      discount_type: 'P',
      discount_value: '0',
      discount_category: 'P',
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      scope: 'A',
      specific_plans: [],
      max_uses: '1',
      is_active: false,
    },
  });

  const { watch: watchAdd, setValue: setAddValue } = addFormMethods;
  const { watch: watchEdit, setValue: setEditValue } = editFormMethods;
  const addDiscountType = watchAdd('discount_type');
  const editDiscountType = watchEdit('discount_type');

  // Effect to update edit form when selectedDiscount changes
  useEffect(() => {
    if (selectedDiscount && showEditModal) {
      console.log('Setting edit form values:', selectedDiscount);
      console.log('selectedDiscount.name:', selectedDiscount.name);
      console.log('selectedDiscount.code:', selectedDiscount.code);
      console.log('selectedDiscount.description:', selectedDiscount.description);
      console.log('selectedDiscount.discount_type:', selectedDiscount.discount_type);
      console.log('selectedDiscount.discount_value:', selectedDiscount.discount_value);
      
      // Reset form with selected discount data
      editFormMethods.reset({
        name: selectedDiscount.name,
        code: selectedDiscount.code,
        description: selectedDiscount.description || '',
        discount_type: selectedDiscount.discount_type,
        discount_value: selectedDiscount.discount_value,
        discount_category: selectedDiscount.discount_category,
        valid_from: selectedDiscount.valid_from,
        valid_until: selectedDiscount.valid_until,
        scope: selectedDiscount.scope,
        specific_plans: selectedDiscount.specific_plans || [],
        max_uses: selectedDiscount.max_uses,
        business: businessId,
        is_active: selectedDiscount.is_active,
      });
      console.log('Form reset completed');
    }
  }, [selectedDiscount?.id, showEditModal, editFormMethods, businessId]);

  const handleAddSubmit = async (data: AddDiscountParams) => {
    try {
      const discountData = {
        ...data,
        business: businessId,
      };
      
      const newDiscount = await discountsService.create(discountData);
      setDiscounts(prev => [...prev, newDiscount]);
      setShowAddModal(false);
      addFormMethods.reset();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Discount added successfully',
      });
    } catch (error) {
      console.error('Error adding discount:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add discount',
      });
    }
  };

  const handleEditSubmit = async (data: UpdateDiscountParams) => {
    try {
      if (!selectedDiscount) return;

      const updateData: UpdateDiscountParams = {
        name: data.name,
        code: data.code,
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_category: data.discount_category,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        scope: data.scope,
        specific_plans: data.specific_plans || [],
        max_uses: data.max_uses,
        business: businessId,
        is_active: data.is_active,
      };

      const updatedDiscount = await discountsService.update(selectedDiscount.id, updateData);
      setDiscounts(prev => prev.map(d => d.id === selectedDiscount.id ? updatedDiscount : d));
      setShowEditModal(false);
      setSelectedDiscount(null);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Discount updated successfully',
      });
    } catch (error) {
      console.error('Error updating discount:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update discount',
      });
    }
  };

  const handleDelete = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      await discountsService.delete(discountId);
      setDiscounts(prev => prev.filter(d => d.id !== discountId));
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Discount deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting discount:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete discount',
      });
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = discounts.map(discount => discount.id);
      setSelectedDiscounts(new Set(allIds));
    } else {
      setSelectedDiscounts(new Set());
    }
  };

  const handleSelectDiscount = (discountId: string, checked: boolean) => {
    const newSelected = new Set(selectedDiscounts);
    if (checked) {
      newSelected.add(discountId);
    } else {
      newSelected.delete(discountId);
    }
    setSelectedDiscounts(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const selectedCount = selectedDiscounts.size;
      for (const discountId of selectedDiscounts) {
        await discountsService.delete(discountId);
      }
      setDiscounts(prev => prev.filter(d => !selectedDiscounts.has(d.id)));
      setSelectedDiscounts(new Set());
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedCount} discounts deleted successfully`,
      });
    } catch (error) {
      console.error('Bulk delete failed:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete some discounts',
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedDiscounts(new Set());
  };

  const loadDiscounts = useCallback(async () => {
    try {
      const response = await discountsService.getAll();
      console.log('Raw response from backend:', response);
      
      // Check if response has data property (new format) or is direct array (old format)
      const discountsData = (response as any).data || response;
      console.log('Discounts data:', discountsData);
      
      const formattedDiscounts: Discount[] = discountsData.map((item: any) => {
        console.log('Processing item:', item);
        const formatted = {
          ...item,
          id: String(item.id),
          business: String(item.business),
          discount_value: String(item.discount_value),
          max_uses: String(item.max_uses),
          specific_plans: Array.isArray(item.specific_plans) 
            ? item.specific_plans.map((p: any) => String(p)) 
            : [],
        };
        console.log('Formatted item:', formatted);
        return formatted;
      });
      
      console.log('Final formatted discounts:', formattedDiscounts);
      setDiscounts(formattedDiscounts);
    } catch (error) {
      console.error('Error loading discounts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load discounts',
      });
    }
  }, [addNotification]);

  useEffect(() => {
    if (isClient) {
      loadDiscounts();
    }
  }, [loadDiscounts, isClient]);

  const handleEdit = (discount: Discount) => {
    console.log('handleEdit called with discount:', discount);
    setSelectedDiscount(discount);
    setShowEditModal(true);
  };

  const handleAddNew = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    addFormMethods.reset();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDiscount(null);
  };

  const columns = [
    {
      header: '',
      accessorKey: 'select',
      cell: ({ row }: { row: { original: Discount } }) => (
        <TableCheckbox
          checked={selectedDiscounts.has(row.original.id)}
          onChange={(checked) => handleSelectDiscount(row.original.id, checked)}
        />
      ),
      size: 50,
    },
    {
      header: 'ID',
      accessorKey: 'id',
      size: 50,
    },
    {
      header: 'Name',
      accessorKey: 'name',
      size: 150,
    },
    {
      header: 'Code',
      accessorKey: 'code',
      size: 100,
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span className="max-w-xs truncate" title={row.original.description}>
          {row.original.description || '-'}
        </span>
      ),
      size: 200,
    },
    {
      header: 'Type',
      accessorKey: 'discount_type',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span>{row.original.discount_type === 'P' ? 'Percentage' : 'Fixed'}</span>
      ),
      size: 100,
    },
    {
      header: 'Value',
      accessorKey: 'discount_value',
      size: 100,
    },
    {
      header: 'Category',
      accessorKey: 'discount_category',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span>{row.original.discount_category === 'P' ? 'Promo' : 'Discount'}</span>
      ),
      size: 100,
    },
    {
      header: 'Scope',
      accessorKey: 'scope',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span>{row.original.scope === 'A' ? 'All Plans' : 'Specific Plans'}</span>
      ),
      size: 120,
    },
    {
      header: 'Valid From',
      accessorKey: 'valid_from',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span>{row.original.valid_from ? new Date(row.original.valid_from).toLocaleDateString() : '-'}</span>
      ),
      size: 120,
    },
    {
      header: 'Valid Until',
      accessorKey: 'valid_until',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span>{row.original.valid_until ? new Date(row.original.valid_until).toLocaleDateString() : '-'}</span>
      ),
      size: 120,
    },
    {
      header: 'Uses',
      accessorKey: 'times_used',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span>{row.original.times_used} / {row.original.max_uses}</span>
      ),
      size: 100,
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      size: 100,
    },
    {
      header: 'Actions',
      cell: ({ row }: { row: { original: Discount } }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-1 text-blue-500 hover:text-blue-700"
            title="Edit"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-1 text-red-500 hover:text-red-700"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
      size: 120,
    },
  ];

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Discounts & Promos
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Manage your discount codes and promotional offers
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Discounts & Promos
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Manage your discount codes and promotional offers
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            <FiPlus className="h-4 w-4" />
            Add Discount
          </button>
        </div>
      </div>

      {/* Add Discount Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                      Add New Discount
                    </h3>
                    <Form<AddDiscountParams>
                      onSubmit={handleAddSubmit}
                      className="space-y-4"
                    >
                      {(formMethods) => (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            {...formMethods.register('name', {
                              required: 'Name is required',
                              minLength: { value: 2, message: 'Name must be at least 2 characters' },
                              maxLength: { value: 100, message: 'Name must be less than 100 characters' },
                              validate: (value) => {
                                if (!value?.trim()) return 'Name cannot be empty';
                                return true;
                              }
                            })}
                            label="Name"
                            placeholder="Enter discount name"
                            methods={formMethods}
                          />
                          <InputField
                            {...formMethods.register('code', {
                              required: 'Code is required',
                              minLength: { value: 3, message: 'Code must be at least 3 characters' },
                              maxLength: { value: 20, message: 'Code must be less than 20 characters' },
                            })}
                            label="Code"
                            placeholder="Enter discount code"
                            methods={formMethods}
                          />
                          <div className="md:col-span-2">
                            <InputField
                              {...formMethods.register('description', {
                                maxLength: { value: 500, message: 'Description must be less than 500 characters' },
                              })}
                              label="Description"
                              placeholder="Enter discount description (optional)"
                              methods={formMethods}
                            />
                          </div>
                          <SelectField
                            {...formMethods.register('discount_type', {
                              required: 'Discount type is required',
                            })}
                            label="Discount Type"
                            options={[
                              { value: 'P', label: 'Percentage (%)' },
                              { value: 'F', label: 'Fixed Amount (ETB)' },
                            ]}
                            methods={formMethods}
                          />
                          <InputField
                            {...formMethods.register('discount_value', {
                              required: 'Discount value is required',
                              validate: (value) => {
                                const numValue = parseFloat(value);
                                if (isNaN(numValue)) return 'Invalid discount value';
                                if (numValue < 0) return 'Discount value must be positive';
                                
                                if (addDiscountType === 'P') {
                                  // For percentage discounts
                                  if (numValue > 1000) {
                                    return 'Percentage cannot exceed 1000%';
                                  }
                                  if (numValue > 100) {
                                    return 'Percentage over 100% is not recommended';
                                  }
                                } else {
                                  // For fixed amount discounts
                                  if (numValue > 1000000) {
                                    return 'Fixed amount cannot exceed 1,000,000 ETB';
                                  }
                                }
                                
                                return true;
                              }
                            })}
                            label={`Discount Value ${addDiscountType === 'P' ? '(%)' : '(ETB)'}`}
                            placeholder={`Enter discount value ${addDiscountType === 'P' ? '(0-100%)' : '(amount)'}`}
                            type="number"
                            methods={formMethods}
                            description={addDiscountType === 'P' 
                              ? 'Enter percentage value (e.g., 10 for 10% discount)' 
                              : 'Enter fixed amount in ETB (e.g., 100 for 100 ETB discount)'
                            }
                          />
                          <SelectField
                            {...formMethods.register('discount_category', {
                              required: 'Discount category is required',
                            })}
                            label="Discount Category"
                            options={[
                              { value: 'P', label: 'Promo' },
                              { value: 'D', label: 'Discount' },
                            ]}
                            methods={formMethods}
                          />
                          <SelectField
                            {...formMethods.register('scope', {
                              required: 'Scope is required',
                            })}
                            label="Scope"
                            options={[
                              { value: 'A', label: 'All Plans' },
                              { value: 'S', label: 'Specific Plans' },
                            ]}
                            methods={formMethods}
                          />
                          <div>
                            <DatePicker
                              {...formMethods.register('valid_from', {
                                required: 'Valid From is required',
                                validate: (value) => {
                                  if (!value) return 'Valid From is required';
                                  const selectedDate = new Date(value);
                                  const now = new Date();
                                  if (selectedDate < now) return 'Valid From date must be in the future';
                                  return true;
                                }
                              })}
                              label="Valid From"
                              methods={formMethods}
                              required
                              allowPastDates={false}
                            />
                          </div>
                          <div>
                            <DatePicker
                              {...formMethods.register('valid_until', {
                                required: 'Valid Until is required',
                                validate: (value) => {
                                  if (!value) return 'Valid Until is required';
                                  const validFrom = formMethods.getValues('valid_from');
                                  if (validFrom && new Date(value) <= new Date(validFrom)) {
                                    return 'Valid until date must be after valid from date';
                                  }
                                  return true;
                                },
                              })}
                              label="Valid Until"
                              methods={formMethods}
                              required
                              allowPastDates={false}
                            />
                          </div>
                          <InputField
                            {...formMethods.register('max_uses', {
                              required: 'Maximum uses is required',
                              pattern: { value: /^[0-9]+$/, message: 'Invalid number format' },
                              min: { value: 1, message: 'Maximum uses must be at least 1' },
                            })}
                            label="Maximum Uses"
                            placeholder="Enter maximum uses"
                            type="number"
                            methods={formMethods}
                          />
                          <div className="md:col-span-2">
                            <CheckboxField
                              {...formMethods.register('is_active')}
                              label="Active Status"
                              description="Enable this discount for use"
                              methods={formMethods}
                            />
                          </div>
                          <div className="flex justify-end gap-3 mt-6 md:col-span-2">
                            <button
                              type="button"
                              onClick={handleCloseAddModal}
                              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                            <SubmitButton className="inline-flex justify-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600">
                              Add Discount
                            </SubmitButton>
                          </div>
                        </div>
                      )}
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Discount Modal */}
      {showEditModal && selectedDiscount && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-800">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                      Edit Discount: {selectedDiscount.name}
                    </h3>
                    <Form<UpdateDiscountParams>
                      key={`edit-form-${selectedDiscount?.id || 'new'}`}
                      onSubmit={handleEditSubmit}
                      defaultValues={{
                        name: selectedDiscount.name,
                        code: selectedDiscount.code,
                        description: selectedDiscount.description || '',
                        discount_type: selectedDiscount.discount_type,
                        discount_value: selectedDiscount.discount_value,
                        discount_category: selectedDiscount.discount_category,
                        valid_from: selectedDiscount.valid_from,
                        valid_until: selectedDiscount.valid_until,
                        scope: selectedDiscount.scope,
                        specific_plans: selectedDiscount.specific_plans || [],
                        max_uses: selectedDiscount.max_uses,
                        business: businessId,
                        is_active: selectedDiscount.is_active,
                      }}
                      className="space-y-4"
                    >
                      {(formMethods) => (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            {...formMethods.register('name', {
                              required: 'Name is required',
                              minLength: { value: 2, message: 'Name must be at least 2 characters' },
                              maxLength: { value: 100, message: 'Name must be less than 100 characters' },
                              validate: (value) => {
                                if (!value?.trim()) return 'Name cannot be empty';
                                return true;
                              }
                            })}
                            label="Name"
                            placeholder="Enter discount name"
                            methods={formMethods}
                          />
                          <InputField
                            {...formMethods.register('code', {
                              required: 'Code is required',
                              minLength: { value: 3, message: 'Code must be at least 3 characters' },
                              maxLength: { value: 20, message: 'Code must be less than 20 characters' },
                            })}
                            label="Code"
                            placeholder="Enter discount code"
                            methods={formMethods}
                          />
                          <div className="md:col-span-2">
                            <InputField
                              {...formMethods.register('description', {
                                maxLength: { value: 500, message: 'Description must be less than 500 characters' },
                              })}
                              label="Description"
                              placeholder="Enter discount description (optional)"
                              methods={formMethods}
                            />
                          </div>
                          <SelectField
                            {...formMethods.register('discount_type', {
                              required: 'Discount type is required',
                            })}
                            label="Discount Type"
                            options={[
                              { value: 'P', label: 'Percentage (%)' },
                              { value: 'F', label: 'Fixed Amount (ETB)' },
                            ]}
                            methods={formMethods}
                          />
                          <InputField
                            {...formMethods.register('discount_value', {
                              required: 'Discount value is required',
                              validate: (value) => {
                                const numValue = parseFloat(value);
                                if (isNaN(numValue)) return 'Invalid discount value';
                                if (numValue < 0) return 'Discount value must be positive';
                                
                                if (editDiscountType === 'P') {
                                  // For percentage discounts
                                  if (numValue > 1000) {
                                    return 'Percentage cannot exceed 1000%';
                                  }
                                  if (numValue > 100) {
                                    return 'Percentage over 100% is not recommended';
                                  }
                                } else {
                                  // For fixed amount discounts
                                  if (numValue > 1000000) {
                                    return 'Fixed amount cannot exceed 1,000,000 ETB';
                                  }
                                }
                                
                                return true;
                              }
                            })}
                            label={`Discount Value ${editDiscountType === 'P' ? '(%)' : '(ETB)'}`}
                            placeholder={`Enter discount value ${editDiscountType === 'P' ? '(0-100%)' : '(amount)'}`}
                            type="number"
                            methods={formMethods}
                            description={editDiscountType === 'P' 
                              ? 'Enter percentage value (e.g., 10 for 10% discount)' 
                              : 'Enter fixed amount in ETB (e.g., 100 for 100 ETB discount)'
                            }
                          />
                          <SelectField
                            {...formMethods.register('discount_category', {
                              required: 'Discount category is required',
                            })}
                            label="Discount Category"
                            options={[
                              { value: 'P', label: 'Promo' },
                              { value: 'D', label: 'Discount' },
                            ]}
                            methods={formMethods}
                          />
                          <SelectField
                            {...formMethods.register('scope', {
                              required: 'Scope is required',
                            })}
                            label="Scope"
                            options={[
                              { value: 'A', label: 'All Plans' },
                              { value: 'S', label: 'Specific Plans' },
                            ]}
                            methods={formMethods}
                          />
                          <div>
                            <DatePicker
                              {...formMethods.register('valid_from', {
                                required: 'Valid From is required',
                                validate: (value) => {
                                  if (!value) return 'Valid From is required';
                                  return true;
                                }
                              })}
                              label="Valid From"
                              methods={formMethods}
                              required
                              allowPastDates={true}
                            />
                          </div>
                          <div>
                            <DatePicker
                              {...formMethods.register('valid_until', {
                                required: 'Valid Until is required',
                                validate: (value) => {
                                  if (!value) return 'Valid Until is required';
                                  const validFrom = formMethods.getValues('valid_from');
                                  if (validFrom && new Date(value) <= new Date(validFrom)) {
                                    return 'Valid until date must be after valid from date';
                                  }
                                  return true;
                                },
                              })}
                              label="Valid Until"
                              methods={formMethods}
                              required
                              allowPastDates={true}
                            />
                          </div>
                          <InputField
                            {...formMethods.register('max_uses', {
                              required: 'Maximum uses is required',
                              pattern: { value: /^[0-9]+$/, message: 'Invalid number format' },
                              min: { value: 1, message: 'Maximum uses must be at least 1' },
                            })}
                            label="Maximum Uses"
                            placeholder="Enter maximum uses"
                            type="number"
                            methods={formMethods}
                          />
                          <div className="md:col-span-2">
                            <CheckboxField
                              {...formMethods.register('is_active')}
                              label="Active Status"
                              description="Enable this discount for use"
                              methods={formMethods}
                            />
                          </div>
                          <div className="flex justify-end gap-3 mt-6 md:col-span-2">
                            <button
                              type="button"
                              onClick={handleCloseEditModal}
                              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                            <SubmitButton className="inline-flex justify-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600">
                              Update Discount
                            </SubmitButton>
                          </div>
                        </div>
                      )}
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discounts Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Discounts List
        </h2>
        
        <BulkActions
          selectedItems={Array.from(selectedDiscounts)}
          onDeleteSelected={handleBulkDelete}
          onClearSelection={handleClearSelection}
          itemName="discounts"
          isLoading={isBulkDeleting}
        />
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    {column.header === '' ? (
                      <TableCheckbox
                        checked={discounts.length > 0 && selectedDiscounts.size === discounts.length}
                        onChange={handleSelectAll}
                      />
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {discounts.map((discount: Discount) => (
                <tr key={discount.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {columns.map((column) => (
                    <td key={column.header} className="px-6 py-4 whitespace-nowrap">
                      {column.cell ? column.cell({ row: { original: discount } }) : discount[column.accessorKey as keyof Discount]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
