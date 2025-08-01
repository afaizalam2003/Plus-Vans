import {
  LucideIcon,
  Calculator,
  TrendingUp,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";

export interface FinancialCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  sections: string[];
  color: string;
  stats?: Array<{ label: string; value: string | number }>;
}

export const getFinancialCategories = (stats?: any): FinancialCategory[] => [
  {
    id: "pricing-quoting",
    title: "Pricing & Quoting",
    description: "Quote management, pricing engine, and ML optimization tools",
    icon: Calculator,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    sections: ["quotes", "pricing", "ml"],
    stats: [
      { label: "Active Quotes", value: stats?.activeQuotes || 0 },
      { label: "Conversion Rate", value: `${stats?.conversionRate || 0}%` },
    ],
  },
  {
    id: "revenue-analytics",
    title: "Revenue & Analytics",
    description:
      "Financial reports, integration dashboard, and performance analytics",
    icon: TrendingUp,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    sections: ["reports", "integration", "sync"],
    stats: [
      {
        label: "Monthly Revenue",
        value: `£${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      },
      { label: "Profit Margin", value: `${stats?.profitMargin || 0}%` },
    ],
  },
  {
    id: "payments-billing",
    title: "Payments & Billing",
    description:
      "Invoice management, payment processing, and subscription handling",
    icon: CreditCard,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    sections: ["invoices", "payments", "subscriptions"],
    stats: [
      { label: "Pending Invoices", value: stats?.pendingInvoices || 0 },
      {
        label: "Outstanding",
        value: `£${(stats?.outstandingAmount || 0).toLocaleString()}`,
      },
    ],
  },
  {
    id: "customer-intelligence",
    title: "Customer Intelligence",
    description:
      "Customer insights, behavioral analysis, and relationship management",
    icon: Users,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    sections: ["customer-intelligence"],
    stats: [
      { label: "Active Customers", value: stats?.activeCustomers || 0 },
      { label: "Retention Rate", value: `${stats?.retentionRate || 0}%` },
    ],
  },
  {
    id: "operations-integration",
    title: "Operations & Integration",
    description: "Job linking, booking integration, and operational workflows",
    icon: Settings,
    color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
    sections: ["job-linking", "booking-integration"],
    stats: [
      { label: "Linked Jobs", value: stats?.linkedJobs || 0 },
      { label: "Sync Status", value: stats?.syncStatus || "Active" },
    ],
  },
];
