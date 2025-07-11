import { IBaseRepository } from "./IBaserRepository";
import { IUserChatlist } from "../../entities/IUserChatlist";

export interface IUserChatlistRepository
  extends IBaseRepository<IUserChatlist> {
    updateChatMessageByChatId(chatId: string, data: Partial<IUserChatlist>): Promise<IUserChatlist | null>
  }
