import { Model } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { IUserChatlist } from "../../entities/IUserChatlist";
import { IUserChatlistRepository } from "../interface/IUserChatlistRepository";
import { UserChatlist } from "../../schemas/userChatlistSchema";
class UserChatlistRepository
  extends BaseRepository<IUserChatlist>
  implements IUserChatlistRepository
{
  constructor(model: Model<IUserChatlist>) {
    super(model);
  }
}

export default new UserChatlistRepository(UserChatlist);
