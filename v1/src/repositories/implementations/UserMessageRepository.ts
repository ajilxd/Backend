import { Model } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { IUserMessage } from "../../entities/IUserMessage";
import { UserMessage } from "../../schemas/userMessageSchema";
import { IUserMessageRepository } from "../interface/IUserMessageRepository";
class UserMessageRepository
  extends BaseRepository<IUserMessage>
  implements IUserMessageRepository
{
  constructor(model: Model<IUserMessage>) {
    super(model);
  }
}

export default new UserMessageRepository(UserMessage);
