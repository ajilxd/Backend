export interface ITransaction {
  customerName: string;
  subscriptionName: string;
  subscribedDate: string;
  expiryDate: string;
  amount: number;
  companyName: string;
  stripeSubsriptionId?: string;
  stripeCustomerId?: string;
}
