import { IBaseRepository } from "./IBaserRepository";
import { IUserMessage } from "../../entities/IUserMessage";

export interface IUserMessageRepository extends IBaseRepository<IUserMessage> {}
