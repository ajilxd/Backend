import { IUserChatlist } from "../../entities/IUserChatlist";
import { IUserMessage } from "../../entities/IUserMessage";
import AppError from "../../errors/appError";
import UserChatlistRepository from "../../repositories/implementations/UserChatlistRepository";
import UserMessageRepository from "../../repositories/implementations/UserMessageRepository";

import { IUserChatlistRepository } from "../../repositories/interface/IUserChatlistRepository";
import { IUserMessageRepository } from "../../repositories/interface/IUserMessageRepository";

import { IUserChatService } from "../interface/IUserChatService";

class UserChatService implements IUserChatService {
  private UserChatlistRepository: IUserChatlistRepository;
  private UserMessageRepository: IUserMessageRepository;

  constructor(
    UserChatlistRepository: IUserChatlistRepository,
    UserMessageRepository: IUserMessageRepository
  ) {
    this.UserChatlistRepository = UserChatlistRepository;
    this.UserMessageRepository = UserMessageRepository;
  }

  createChat(data: Partial<IUserChatlist>): Promise<IUserChatlist> {
    return this.UserChatlistRepository.create(data);
  }

  async updateChat(
    chatId: string,
    data: Partial<IUserChatlist>
  ): Promise<IUserChatlist> {
    const result = await this.UserChatlistRepository.update(chatId, data);
    if (result) return result;
    throw new AppError(`Failed to update chat (${chatId})`, 500, "error");
  }

  async findChatsByUserId(userId: string): Promise<IUserChatlist[]> {
    const result = await this.UserChatlistRepository.find({
      "participants.userId": userId,
    });

    if (result.length > 0) return result;

    throw new AppError(
      `No chats found with this user ID (${userId})`,
      404,
      "warn"
    );
  }

  async findMessageByChatId(chatId: string): Promise<IUserMessage[]> {
    const result = await this.UserMessageRepository.find({ chatId });
    if (result.length > 0) return result;

    throw new AppError(`No messages found for chatId (${chatId})`, 404, "warn");
  }

  async deleteMessageByMessageId(messageId: string): Promise<IUserMessage> {
    const deleted = await this.UserMessageRepository.update(messageId, {
      isDeleted: true,
    });

    if (deleted) return deleted;

    throw new AppError(`Failed to delete message (${messageId})`, 500, "error");
  }

  async readMessages(chatId: string, userId: string): Promise<void> {
    const messagesToUpdate = await this.UserMessageRepository.find({
      chatId,
      receiverId: userId,
      read: false,
    });

    await Promise.all(
      messagesToUpdate.map((msg) =>
        this.UserMessageRepository.update(msg._id, { read: true })
      )
    );
  }
}

export default new UserChatService(
  UserChatlistRepository,
  UserMessageRepository
);
