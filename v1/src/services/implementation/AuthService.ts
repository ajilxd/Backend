import config from "../../config";
import jwt from "jsonwebtoken";
import AppError from "../../errors/appError";
import { IManagerRepository } from "../../repositories/interface/IManagerRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { IAuthService } from "../interface/IAuthService";
import UserRepository from "../../repositories/implementations/UserRepository";
import ManagerRepository from "../../repositories/implementations/ManagerRepository";
type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

class Authservice implements IAuthService {
  private ManagerRepository: IManagerRepository;
  private UserRepository: IUserRepository;
  constructor(
    UserRepository: IUserRepository,
    ManagerRepository: IManagerRepository
  ) {
    this.ManagerRepository = ManagerRepository;
    this.UserRepository = UserRepository;
  }
  async authenticateUser(
    email: string,
    role: "user" | "manager"
  ): Promise<TokenResponse> {
    if (role === "manager") {
      const managerData = await this.ManagerRepository.findOne({ email });
      if (!managerData) {
        throw new AppError("No manager account found", 500);
      }
      if (!config.GENERAL_ACCESS_SECRET) {
        throw new AppError("No secrets provided for jwt - [manager,user]", 500);
      }

      if (!config.GENERAL_REFRESH_SECRET) {
        throw new AppError("No secrets provided for jwt - [manager,user]", 500);
      }

      const accessToken = jwt.sign(
        { id: managerData._id, email: managerData.email, role: "manager" },
        config.GENERAL_ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: managerData._id, email: managerData.email, role: "manager" },
        config.GENERAL_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      const updated = await this.ManagerRepository.update(
        "" + managerData._id,
        { refreshToken }
      );
      if (!updated || !updated.refreshToken) {
        throw new AppError("failed updating refresh token on mongodb", 500);
      }

      if (!refreshToken || !accessToken) {
        throw new AppError(
          "failed to generate accesstoken and refreshtoken",
          500
        );
      }
      return { refreshToken, accessToken };
    } else if (role === "user") {
      const userData = await this.UserRepository.findOne({ email });
      if (!userData) {
        throw new AppError("No user account found ", 500);
      }
      if (!config.GENERAL_ACCESS_SECRET) {
        throw new AppError("No secrets provided for jwt - [manager,user]", 500);
      }

      if (!config.GENERAL_REFRESH_SECRET) {
        throw new AppError("No secrets provided for jwt - [manager,user]", 500);
      }

      const accessToken = jwt.sign(
        { id: userData._id, email: userData.email, role: "user" },
        config.GENERAL_ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: userData._id, email: userData.email, role: "user" },
        config.GENERAL_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      const updated = await this.UserRepository.update("" + userData._id, {
        refreshToken,
      });
      if (!updated || !updated.refreshToken) {
        throw new AppError("failed updating refresh token on mongodb", 500);
      }
      return { accessToken, refreshToken };
    } else {
      throw new AppError("unexpected role", 500);
    }
  }

  async clearRefreshToken(email: string, role: string): Promise<void> {
    if (role === "manager") {
      const managerData = await this.ManagerRepository.findOne({ email });
      if (!managerData) {
        throw new AppError("failed to find the manager account ", 404);
      }
      await this.ManagerRepository.resetRefreshToken("" + managerData._id);
    } else if (role === "user") {
      const userData = await this.ManagerRepository.findOne({ email });
      if (!userData) {
        throw new AppError("failed to find the manager account ", 404);
      }
      await this.ManagerRepository.resetRefreshToken("" + userData._id);
    }
  }
}

export default new Authservice(UserRepository, ManagerRepository);
