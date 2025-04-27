import { ITokenService } from "../interface/ITokenService";
import generateRandomString from "../../utils/GenerateRandomCharacters";
import { logger } from "../../utils/logger";
import TokenRepository from "../../repositories/implementations/TokenRepository";

import { ITokenRepository } from "../../repositories/interface/ITokenRepository";
import sendEmail from "../../utils/sendMail";
import AppError from "../../errors/appError";

import { errorMap, ErrorType } from "../../constants/response.failture";
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
      logger.error(
        `${new Date().toLocaleString()} - Password token collection error`
      );
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
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
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
      );
    }
  }

  async verifyToken(email: string, token: string): Promise<IToken> {
    console.log(`${email} ,${token} from verify token`);
    const data = await this.TokenRepository.findOne({ email });
    console.log("hey iam from the verify token service", data);
    if (!data) {
      logger.info(
        `${new Date().toLocaleString()} : No token for you (${email})`
      );
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }
    if (data.token === token) {
      console.log("hey....we got right token");
      return data;
    } else {
      logger.info(
        `${new Date().toLocaleString()} : invalid token or expired token (${email})`
      );
      throw new AppError(
        errorMap[ErrorType.Unauthorized].message,
        errorMap[ErrorType.Unauthorized].code
      );
    }
  }
}

export default new TokenService(TokenRepository);
