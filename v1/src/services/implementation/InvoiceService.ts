import { IInvoice } from "../../entities/IInvoice";
import InvoiceRepository from "../../repositories/implementations/InvoiceRepository";
import { IInvoiceRepository } from "../../repositories/interface/IInvoiceRepository";
import { IInvoiceService } from "../interface/IInvoiceService";

class InvoiceService implements IInvoiceService {
  constructor(private InvoiceRepository: IInvoiceRepository) {}

  fetchInvoicesBycustomerId(customerId: string): Promise<IInvoice[]> {
    return this.InvoiceRepository.findByCustomerId(customerId);
  }
  createInvoice(data: Partial<IInvoice>): Promise<IInvoice> {
    return this.InvoiceRepository.create(data);
  }
}

export default new InvoiceService(InvoiceRepository);
