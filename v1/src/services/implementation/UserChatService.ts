import { nanoid } from "nanoid";
import { IUserChatlist } from "../../entities/IUserChatlist";
import { IUserMessage } from "../../entities/IUserMessage";
import AppError from "../../errors/appError";
import UserChatlistRepository from "../../repositories/implementations/UserChatlistRepository";
import UserMessageRepository from "../../repositories/implementations/UserMessageRepository";

import { IUserChatlistRepository } from "../../repositories/interface/IUserChatlistRepository";
import { IUserMessageRepository } from "../../repositories/interface/IUserMessageRepository";

import { IUserChatService } from "../interface/IUserChatService";
import { UserMessage } from "aws-sdk/clients/qbusiness";

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

  async createChat(data: Partial<IUserChatlist>): Promise<IUserChatlist> {
    const chatId = nanoid();
    return this.UserChatlistRepository.create({ ...data, chatId });
  }

  async updateChatLastMessage(
    chatId: string,
    data: Partial<IUserChatlist>
  ): Promise<IUserChatlist> {
    const result = await this.UserChatlistRepository.updateChatMessageByChatId(
      chatId,
      data
    );
    if (result) return result;
    throw new AppError(`Failed to update chat (${chatId})`, 500, "error");
  }

  async findChatsByUserId(userId: string): Promise<IUserChatlist[]> {
    const result = await this.UserChatlistRepository.find({
      participants: userId,
    });

    if (result.length > 0) return result;

    throw new AppError(
      `No chats found with this user ID (${userId})`,
      404,
      "warn"
    );
  }

  async findChatByParticipantsId(
    participantId1: string,
    participantId2: string
  ): Promise<IUserChatlist[]> {
    const result = await this.UserChatlistRepository.find({
      participants: { $all: [participantId1, participantId2] },
    });
    return result;
  }

  async createMessageByChatId(data: Partial<IUserMessage>) {
    if (!data.chatId) {
      throw new AppError("No chat id ", 400, "warn");
    }

    if (!data.content) {
      throw new AppError("No message content found", 400, "warn");
    }

    if (!data.type) {
      throw new AppError("No message type found", 400, "warn");
    }
    return this.UserMessageRepository.create(data);
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

  async getChatMessage(
    participantId1: string,
    participantId2: string
  ): Promise<IUserMessage[]> {
    const chat = await this.findChatByParticipantsId(
      participantId1,
      participantId2
    );
    if (!chat.length) {
      throw new AppError(
        `No chats with ${participantId1} ${participantId2}`,
        204
      );
    }

    const messages = await this.findMessageByChatId(chat[0].chatId);
    return messages;
  }
}

export default new UserChatService(
  UserChatlistRepository,
  UserMessageRepository
);
