import { ITransaction } from "../../entities/ITransaction";

export interface ITransactionService {
  create(transaction: ITransaction): Promise<ITransaction>;
  fetchAll(): Promise<ITransaction[]>;
  fetchByCustomerId(customerId: string): Promise<ITransaction[]>;
}
