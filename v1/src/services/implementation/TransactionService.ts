import { ITransaction } from "../../entities/ITransaction";
import TransactionRepository from "../../repositories/implementations/TransactionRepository";
import { ITransactionRepository } from "../../repositories/interface/ITransactionRepository";
import { ITransactionService } from "../interface/ITransactionService";

class TransactionService implements ITransactionService {
  private TransactionRepository: ITransactionRepository;
  constructor(TransactionRepository: ITransactionRepository) {
    this.TransactionRepository = TransactionRepository;
  }

  create(transaction: ITransaction): Promise<ITransaction> {
    return this.TransactionRepository.create(transaction);
  }

  fetchAll(): Promise<ITransaction[]> {
    return this.TransactionRepository.findAll();
  }

  fetchByCustomerId(customerId: string): Promise<ITransaction[]> {
    return this.TransactionRepository.find({ customerId });
  }
}

export default new TransactionService(TransactionRepository);
