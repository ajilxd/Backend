export interface ITransaction {
  customerId: string;
  customerName: string;
  subscriptionName: string;
  subscribedDate?: Date | null;
  expiryDate?: Date | null;
  amount?: number;
  companyName: string;
  stripeSubsriptionId?: string;
  stripeCustomerId?: string;
  status: string;
  transactionType: string;
  createdAt?: string;
  errorMessage?: string;
  billingCycle?: string;
  subscriptionId: string;
  isInitial?: boolean;
  upgrade?: boolean;
  isCancled?: boolean;
}
