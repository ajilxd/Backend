import { IBaseRepository } from "./IBaserRepository";
import { IDoc } from "../../entities/IDoc";
import { IInvoice } from "../../entities/IInvoice";

export interface IInvoiceRepository extends IBaseRepository<IInvoice> {
  findByCustomerId(customerId: string): Promise<IInvoice[]>;
}
