import AppError from "../../errors/appError";
import AdminRepository from "../../repositories/implementations/AdminRepository";
import { IAdminRepository } from "../../repositories/interface/IAdminRepository";
import { IAdminService } from "../interface/IAdminService";
import bcrypt from "bcryptjs";
import { errorMap } from "../../constants/response.failture";
import { ErrorType } from "../../constants/response.failture";
import jwt from "jsonwebtoken";
import config from "../../config";

class AdminService implements IAdminService {
  private AdminRepository: IAdminRepository;
  constructor(AdminRepository: IAdminRepository) {
    this.AdminRepository = AdminRepository;
  }

  async authenticateAdmin(email: string, password: string) {
    const adminAccount = await this.AdminRepository.findOne({ email });
    if (!adminAccount) throw new AppError("Invalid email", 400, "warn");

    const match = await bcrypt.compare(password, adminAccount.password);
    if (!match) {
      throw new AppError("Invalid credentials", 403, "warn");
    } else {
      if (!config.GENERAL_ACCESS_SECRET) {
        throw new AppError(
          "GENERAL_ACCESS_SECRET is not defined in the config",
          500,
          "error"
        );
      }
      if (!config.GENERAL_REFRESH_SECRET) {
        throw new AppError(
          "GENERAL_REFRESH_SECRET is not defined in the config",
          500,
          "error"
        );
      }
      const accessToken = jwt.sign(
        { id: adminAccount._id, email: adminAccount.email, role: "admin" },
        config.GENERAL_ACCESS_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        {
          id: adminAccount._id,
          email: adminAccount.email,
          role: "admin",
        },
        config.GENERAL_REFRESH_SECRET,
        {
          expiresIn: "7d",
        }
      );

      const updatedAdmin = await this.AdminRepository.update(
        String(adminAccount._id),
        {
          refreshToken,
        }
      );

      if (!updatedAdmin) {
        throw new AppError("failed to update Admin collection", 500, "error");
      }

      return { accessToken, refreshToken };
    }
  }
  async clearRefreshToken() {
    const admin = await this.AdminRepository.findOne({});
    if (admin && admin._id) {
      const updateAdmin = await this.AdminRepository.resetRefreshToken(
        String(admin._id)
      );
      if (!updateAdmin) {
        throw new AppError(
          "failed to reset the refresh token in database",
          500,
          "error"
        );
      }
    } else {
      throw new AppError(errorMap[ErrorType.NotFound].message, 500, "error");
    }
  }
}

export default new AdminService(AdminRepository);
