import { Chat } from "../../schemas/chatSchema";
import { IChat } from "../../entities/IChat";
import { IChatRepository } from "../interface/IChatRepository";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";

class ChatRepository extends BaseRepository<IChat> implements IChatRepository {
  constructor(model: Model<IChat>) {
    super(model);
  }
  findByRoomId(room: string): Promise<IChat[] | []> {
    return Chat.find({ room });
  }
}

export default new ChatRepository(Chat);
