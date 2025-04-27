import { IToken } from "../../entities/IToken";
import { ITokenRepository } from "../interface/ITokenRepository";
import { Token } from "../../schemas/tokenSchema";
import { BaseRepository } from "./BaseRepository";

class TokenRepository
  extends BaseRepository<IToken>
  implements ITokenRepository
{
  constructor() {
    super(Token);
  }
}

export default new TokenRepository();
