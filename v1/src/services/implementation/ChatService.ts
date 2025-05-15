import { IChat } from "../../entities/IChat";
import AppError from "../../errors/appError";
import ChatRepository from "../../repositories/implementations/ChatRepository";
import { IChatRepository } from "../../repositories/interface/IChatRepository";
import { IChatService } from "../interface/IChatService";

class ChatService implements IChatService {
  private ChatRepository: IChatRepository;
  constructor(ChatRepository: IChatRepository) {
    this.ChatRepository = ChatRepository;
  }

  async createChat(data: Partial<IChat>): Promise<IChat> {
    const result = await this.ChatRepository.create(data);
    if (result) {
      return result;
    } else {
      throw new AppError("failed at creating chat", 500);
    }
  }

  async updateChat(data: Partial<IChat>): Promise<IChat> {
    const updated = await this.updateChat(data);
    if (updated) {
      return updated;
    } else {
      throw new AppError("failed updating chat", 500);
    }
  }

  async findChatsByRoom(room: string): Promise<IChat[] | []> {
    const result = await this.ChatRepository.findByRoomId(room);
    if (result.length) {
      return result;
    } else {
      return [];
    }
  }
}

export default new ChatService(ChatRepository);
