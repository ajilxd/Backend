import { IToken } from "../../entities/IToken";
export interface ITokenService {
  createPasswordToken(email: string): Promise<IToken>;
  deleteToken(email: string): Promise<IToken>;
  verifyToken(email: string, token: string): Promise<IToken>;
}
