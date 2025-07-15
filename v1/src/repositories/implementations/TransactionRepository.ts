import { Model } from "mongoose";
import { ITransaction } from "../../entities/ITransaction";
import { ITransactionRepository } from "../interface/ITransactionRepository";
import { BaseRepository } from "./BaseRepository";
import { Transaction } from "../../schemas/transactionSchema";

class TransactionRepository
  extends BaseRepository<ITransaction>
  implements ITransactionRepository
{
  constructor(model: Model<ITransaction>) {
    super(model);
  }
}

export default new TransactionRepository(Transaction);
