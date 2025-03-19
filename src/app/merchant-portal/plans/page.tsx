"use client";

import { FiEdit2, FiTrash2, FiPlus, FiCheck } from "react-icons/fi";

// Mock data - replace with real data from your API
const plans = [
  {
    id: 1,
    name: "Basic Plan",
    price: 29.99,
    period: "monthly",
    activeMembers: 245,
    revenue: "$7,347.55",
    features: [
      "Access to gym equipment",
      "Basic fitness classes",
      "Locker room access",
      "Fitness assessment",
    ],
  },
  {
    id: 2,
    name: "Premium Plan",
    price: 49.99,
    period: "monthly",
    activeMembers: 168,
    revenue: "$8,398.32",
    features: [
      "All Basic Plan features",
      "Unlimited fitness classes",
      "Personal trainer sessions",
      "Nutrition consultation",
      "Spa access",
    ],
  },
  {
    id: 3,
    name: "Family Plan",
    price: 89.99,
    period: "monthly",
    activeMembers: 92,
    revenue: "$8,279.08",
    features: [
      "Up to 4 family members",
      "All Premium Plan features",
      "Family fitness classes",
      "Childcare services",
      "Family events access",
    ],
  },
];

const PlansPage = () => {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
            Subscription Plans
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
            Manage your subscription plans and pricing
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
          <FiPlus className="h-4 w-4" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                {plan.name}
              </h3>
              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 dark:text-dark-muted dark:hover:bg-dark-bg">
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 dark:text-dark-muted dark:hover:bg-dark-bg">
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                ${plan.price}
                <span className="text-base font-normal text-gray-600 dark:text-dark-muted">
                  /{plan.period}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FiCheck className="mt-1 h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-400" />
                    <span className="text-sm text-gray-600 dark:text-dark-muted">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-6 dark:border-dark-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-muted">
                  Active Members
                </span>
                <span className="font-medium text-gray-900 dark:text-dark-text">
                  {plan.activeMembers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-muted">
                  Monthly Revenue
                </span>
                <span className="font-medium text-gray-900 dark:text-dark-text">
                  {plan.revenue}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
