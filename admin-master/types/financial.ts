import { User } from './user';

export interface FinancialQuote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer?: User;
  vehicleType: string;
  pickupLocation: string;
  dropoffLocation: string;
  distance: number;
  duration: number;
  basePrice: number;
  distancePrice: number;
  timePrice: number;
  serviceFee: number;
  taxAmount: number;
  discountAmount: number;
  totalPrice: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  validUntil: Date | string;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  sentAt?: Date | string;
  acceptedAt?: Date | string;
  rejectedAt?: Date | string;
  convertedAt?: Date | string;
  convertedToBookingId?: string;
  createdById: string;
  createdBy?: User;
  metadata?: Record<string, any>;
  lineItems?: QuoteLineItem[];
  additionalCharges?: AdditionalCharge[];
  taxBreakdown?: TaxBreakdown[];
}

export interface QuoteLineItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  metadata?: Record<string, any>;
}

export interface AdditionalCharge {
  id: string;
  quoteId: string;
  description: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  metadata?: Record<string, any>;
}

export interface TaxBreakdown {
  name: string;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: User;
  quoteId?: string;
  bookingId?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partially_paid' | 'cancelled';
  issueDate: Date | string;
  dueDate: Date | string;
  paidDate?: Date | string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  lineItems?: InvoiceLineItem[];
  payments?: Payment[];
  metadata?: Record<string, any>;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  paymentDate: Date | string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}
