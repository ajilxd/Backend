import { IUserChatlist } from "../../entities/IUserChatlist";
import { IUserMessage } from "../../entities/IUserMessage";

export interface IUserChatService {
  createChat(data: Partial<IUserChatlist>): Promise<IUserChatlist>;
  updateChatLastMessage(
    chatId: string,
    data: Partial<IUserChatlist>
  ): Promise<IUserChatlist>;
  findChatsByUserId(userId: string): Promise<IUserChatlist[]>;
  findMessageByChatId(chatId: string): Promise<IUserMessage[]>;
  deleteMessageByMessageId(messageId: string): Promise<IUserMessage>;
}
