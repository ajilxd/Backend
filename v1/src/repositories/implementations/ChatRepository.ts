import { Chat } from "../../schemas/chatSchema";
import { IChat } from "../../entities/IChat";
import { IChatRepository } from "../interface/IChatRepository";
import { BaseRepository } from "./BaseRepository";

class ChatRepository extends BaseRepository<IChat> implements IChatRepository {
  constructor() {
    super(Chat);
  }

  async findByRoomId(room: string): Promise<IChat[] | []> {
    const result = await Chat.find({ room });

    if (result) {
      return result;
    } else {
      return [];
    }
  }
}

export default new ChatRepository();
