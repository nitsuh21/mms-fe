"use client";

import { use } from 'react';
import { useEffect, useState } from 'react';
import { Form, InputField, SelectField, SubmitButton } from '@/components/ui/Form';
import { useNotification } from '@/context/NotificationContext';
import { FiPlus, FiEdit2, FiTrash2, FiLink } from 'react-icons/fi';
import { discountsService } from '@/services/discounts';
import { useForm, SubmitHandler } from 'react-hook-form';
import { DatePicker } from '@/components/ui/DatePicker';

interface Discount {
  id: string;
  business: string;
  name: string;
  code: string;
  description: string;
  discount_type: 'P' | 'F';
  discount_value: string;
  discount_category: 'P' | 'D';
  is_recurring: 'O' | 'R';
  cycle_limit: string | null;
  current_cycle: number;
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans: string[];
  max_uses: string;
  times_used: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: string;
  business: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'D' | 'W' | 'M' | 'Y';
  trial_days: number;
  features: Record<string, any>;
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
  is_recurring: 'O' | 'R';
  cycle_limit?: string;
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans?: string[];
  max_uses: string;
}

interface UpdateDiscountParams {
  name: string;
  code: string;
  description: string;
  discount_type: 'P' | 'F';
  discount_value: string;
  discount_category: 'P' | 'D';
  is_recurring: 'O' | 'R';
  cycle_limit: string | null;
  valid_from: string;
  valid_until: string;
  scope: 'A' | 'S';
  specific_plans: string[];
  max_uses: string;
  business: string;
}

export default function DiscountsPage({ params }: { params: { businessId: string } }) {
  const businessId = params.businessId;
  
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const { addNotification } = useNotification();

  const defaultValues: AddDiscountParams = {
    business: businessId,
    name: '',
    code: '',
    description: '',
    discount_type: 'P',
    discount_value: '0',
    discount_category: 'P',
    is_recurring: 'O',
    cycle_limit: '',
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    scope: 'A',
    specific_plans: [],
    max_uses: '0',
  };

  const methods = useForm<AddDiscountParams>({
    defaultValues: selectedDiscount ? {
      ...defaultValues,
      ...selectedDiscount,
      cycle_limit: selectedDiscount.cycle_limit || '',
      specific_plans: selectedDiscount.specific_plans || [],
    } : defaultValues,
  });

  const { handleSubmit, register, reset } = methods;

  const onSubmit: SubmitHandler<AddDiscountParams> = async (data) => {
    try {
      if (selectedDiscount) {
        await handleUpdateDiscount(selectedDiscount.id, data);
      } else {
        await handleAddDiscount(data);
      }
      setShowAddDiscount(false);
      reset(defaultValues);
    } catch (error) {
      console.error('Form submission error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save discount',
      });
    }
  };

  const handleAddDiscount = async (data: AddDiscountParams) => {
    try {
      const newDiscount = await discountsService.create(data);
      setDiscounts(prev => [...prev, newDiscount]);
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

  const handleUpdateDiscount = async (id: string, data: AddDiscountParams) => {
    try {
      // Convert the data to UpdateDiscountParams format
      const updateData: UpdateDiscountParams = {
        name: data.name,
        code: data.code,
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_category: data.discount_category,
        is_recurring: data.is_recurring,
        cycle_limit: data.cycle_limit || null,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        scope: data.scope,
        specific_plans: data.specific_plans || [],
        max_uses: data.max_uses,
        business: businessId,
      };

      const updatedDiscount = await discountsService.update(id, updateData);
      setDiscounts(prev => (prev?.map(d => d.id === id ? updatedDiscount : d) || []) as Discount[]);
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await discountsService.delete(id);
        setDiscounts(prev => (prev?.filter(d => d.id !== id) || []) as Discount[]);
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
    }
  };

  useEffect(() => {
    loadDiscounts();
    //loadPlans();
  }, []);

  const loadDiscounts = async () => {
    try {
      const response = await discountsService.getAll();
      const formattedDiscounts: Discount[] = response.map((discount: any) => ({
        ...discount,
        id: discount.id.toString(),
        business: discount.business.toString(),
        discount_value: discount.discount_value.toString(),
        max_uses: discount.max_uses.toString(),
        specific_plans: discount.specific_plans.map((p: any) => p.toString()),
      }));
      setDiscounts(formattedDiscounts);
    } catch (error) {
      console.error('Error loading discounts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load discounts',
      });
    }
  };

  // const loadPlans = async () => {
  //   try {
  //     const data = await planService.getAll();
  //     setPlans(data);
  //   } catch (error) {
  //     console.error('Error loading plans:', error);
  //     addNotification({
  //       type: 'error',
  //       title: 'Error',
  //       message: 'Failed to load plans',
  //     });
  //   }
  // };


  const handleEdit = (discount: Discount) => {
    setSelectedDiscount(discount);
    setShowAddDiscount(true);
    reset({
      name: discount.name,
      code: discount.code,
      description: discount.description,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      discount_category: discount.discount_category,
      is_recurring: discount.is_recurring,
      cycle_limit: discount.cycle_limit || '',
      valid_from: discount.valid_from,
      valid_until: discount.valid_until,
      scope: discount.scope,
      specific_plans: discount.specific_plans || [],
      max_uses: discount.max_uses,
    });
  };

  const columns = [
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
      header: 'Recurring',
      accessorKey: 'is_recurring',
      cell: ({ row }: { row: { original: Discount } }) => (
        <span>{row.original.is_recurring === 'R' ? 'Yes' : 'One-time'}</span>
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

        <button
          onClick={() => {
            setSelectedDiscount(null);
            setShowAddDiscount(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <FiPlus className="h-4 w-4" />
          Add Discount
        </button>
      </div>

      {/* Add/Edit Discount Form */}
      {showAddDiscount && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {selectedDiscount ? 'Edit Discount' : 'Add New Discount'}
          </h2>
          <Form<AddDiscountParams>
            onSubmit={onSubmit}
            defaultValues={methods.getValues()}
            className="space-y-4"
          >
            {(formMethods) => (
              <div className="space-y-4">
                <InputField
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
                  })}
                  label="Name"
                  placeholder={selectedDiscount?.name || "Enter discount name"}
                  methods={formMethods}
                />
                <InputField
                  {...register('code', {
                    required: 'Code is required',
                    minLength: { value: 3, message: 'Code must be at least 3 characters' },
                    maxLength: { value: 20, message: 'Code must be less than 20 characters' },
                  })}
                  label="Code"
                  placeholder={selectedDiscount?.code || "Enter discount code"}
                  methods={formMethods}
                />
                <SelectField
                  {...register('discount_type', {
                    required: 'Discount type is required',
                  })}
                  label="Discount Type"
                  options={[
                    { value: 'P', label: 'Percentage' },
                    { value: 'F', label: 'Fixed Amount' },
                  ]}
                  methods={formMethods}
                />
                <InputField
                  {...register('discount_value', {
                    required: 'Discount value is required',
                    pattern: { value: /^[0-9]+(\.[0-9]{1,2})?$/, message: 'Invalid discount value' },
                    min: { value: 0, message: 'Discount value must be positive' },
                  })}
                  label="Discount Value"
                  placeholder={selectedDiscount?.discount_value || "Enter discount value"}
                  type="number"
                  methods={formMethods}
                />
                <SelectField
                  {...register('discount_category', {
                    required: 'Discount category is required',
                  })}
                  label="Discount Category"
                  options={[
                    { value: 'P', label: 'Product' },
                    { value: 'D', label: 'Discount' },
                  ]}
                  methods={formMethods}
                />
                <InputField
                  {...register('cycle_limit', {
                    validate: (value: string | undefined) => {
                      if (!value) return true;
                      const num = parseInt(value);
                      return !isNaN(num) && num >= 0 || 'Please enter a valid non-negative integer';
                    }
                  } as any)}
                  label="Cycle Limit"
                  placeholder="Enter cycle limit"
                  type="number"
                  methods={formMethods}
                />
                <div className="sm:col-span-2">
                  <DatePicker
                    {...register('valid_from', {
                      required: 'Valid From is required',
                    })}
                    label="Valid From"
                    methods={formMethods}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <DatePicker
                    {...register('valid_until', {
                      required: 'Valid Until is required',
                      validate: (value) => {
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
                  />
                </div>
                <InputField
                  {...register('max_uses', {
                    required: 'Maximum uses is required',
                    pattern: { value: /^[0-9]+$/, message: 'Invalid number format' },
                    min: { value: 1, message: 'Maximum uses must be at least 1' },
                  })}
                  label="Maximum Uses"
                  placeholder="Enter maximum uses"
                  type="number"
                  methods={formMethods}
                />
                <SubmitButton>
                  {selectedDiscount ? 'Update Discount' : 'Add Discounts'}
                </SubmitButton>
              </div>
            )}
          </Form>
        </div>
      )}

      {/* Discounts Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Discounts List
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {(discounts as any).map((discount: Discount) => (
                <tr key={discount.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {columns.map((column) => (
                    <td key={column.header} className="px-6 py-4 whitespace-nowrap">
                      {column.cell ? column.cell({ row: { original: discount } }) : (discount as any)[column.accessorKey]}
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
