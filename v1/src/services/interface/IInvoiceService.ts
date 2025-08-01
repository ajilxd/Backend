import { IInvoice } from "../../entities/IInvoice";

export interface IInvoiceService {
  createInvoice(data: Partial<IInvoice>): Promise<IInvoice>;
  fetchInvoicesBycustomerId(customerId: string): Promise<IInvoice[]>;
}
