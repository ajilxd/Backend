import { ITokenService } from "../interface/ITokenService";
import generateRandomString from "../../utils/GenerateRandomCharacters";
import { logger } from "../../utils/logger";
import TokenRepository from "../../repositories/implementations/TokenRepository";

import { ITokenRepository } from "../../repositories/interface/ITokenRepository";
import sendEmail from "../../utils/sendMail";
import AppError from "../../errors/appError";

import { IToken } from "../../entities/IToken";

class TokenService implements ITokenService {
  private TokenRepository: ITokenRepository;
  constructor(TokenRepository: ITokenRepository) {
    this.TokenRepository = TokenRepository;
  }
  async createPasswordToken(email: string): Promise<IToken> {
    const token = generateRandomString(8);

    const result = await TokenRepository.create({
      email,
      token,
    });

    await sendEmail(email, "forgot-password", "forgot-password", {
      subject: "Password reset",
      name: "user",
      text: token,
    });
    logger.info("succesfully sent the forgot password email");
    if (result) {
      return result;
    } else {
      throw new AppError(
        `${new Date().toLocaleString()} - Password token collection error`,
        500,
        "error"
      );
    }
  }

  async deleteToken(id: string): Promise<IToken> {
    const deleted = await TokenRepository.delete(id);
    if (deleted) {
      return deleted;
    } else {
      logger.error(
        `${new Date().toLocaleString()} : error at deleting token document in token collection`
      );
      throw new AppError(
        `${new Date().toLocaleString()} : error at deleting token document in token collection`,
        500,
        "error"
      );
    }
  }

  async verifyToken(email: string, token: string): Promise<IToken> {
    const data = await this.TokenRepository.findOne({ email });

    if (!data) {
      throw new AppError(
        ` ${new Date().toLocaleString()} : No token for you (${email})`,
        404,
        "warn"
      );
    }
    if (data.token === token) {
      return data;
    } else {
      throw new AppError(
        `${new Date().toLocaleString()} : invalid token or expired token (${email})`,
        401
      );
    }
  }
}

export default new TokenService(TokenRepository);
