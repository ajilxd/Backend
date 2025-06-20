import { IToken } from "../../entities/IToken";
import { ITokenRepository } from "../interface/ITokenRepository";
import { Token } from "../../schemas/tokenSchema";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";

class TokenRepository
  extends BaseRepository<IToken>
  implements ITokenRepository
{
  constructor(model: Model<IToken>) {
    super(model);
  }
}

export default new TokenRepository(Token);
