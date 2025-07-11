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

  updateChatMessageByChatId(chatId:string,data:Partial<IUserChatlist>):Promise<IUserChatlist|null>{
    return this.model.findOneAndUpdate({chatId},{$set:{lastMessage:data.lastMessage,lastMessageTime:data.lastMessageTime}},{new:true}).exec()
   
  }
}

export default new UserChatlistRepository(UserChatlist);
