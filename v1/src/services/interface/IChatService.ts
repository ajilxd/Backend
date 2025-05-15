import { IChat } from "../../entities/IChat";

export interface IChatService {
  createChat(data: Partial<IChat>): Promise<IChat>;
  updateChat(data: Partial<IChat>): Promise<IChat>;
  findChatsByRoom(room: string): Promise<IChat[] | []>;
}
