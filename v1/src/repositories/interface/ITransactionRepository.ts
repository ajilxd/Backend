import { ITransaction } from "../../entities/ITransaction";
import { IBaseRepository } from "./IBaserRepository";

export interface ITransactionRepository extends IBaseRepository<ITransaction> {}
