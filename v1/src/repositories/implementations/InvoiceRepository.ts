import { Model } from "mongoose";
import { IInvoice } from "../../entities/IInvoice";
import { IInvoiceRepository } from "../interface/IInvoiceRepository";
import { BaseRepository } from "./BaseRepository";
import { Invoice } from "../../schemas/invoiceSchema";

class InvoiceRepository
  extends BaseRepository<IInvoice>
  implements IInvoiceRepository
{
  constructor(model: Model<IInvoice>) {
    super(model);
  }

  findByCustomerId(customerId: string): Promise<IInvoice[]> {
    return this.find({ customerId });
  }
}

export default new InvoiceRepository(Invoice);
