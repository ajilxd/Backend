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
    if (!adminAccount)
      throw new AppError("Invalid email", errorMap[ErrorType.NotFound].code);

    const match = await bcrypt.compare(password, adminAccount.password);
    if (!match) {
      throw new AppError(
        "Invalid credentials",
        errorMap[ErrorType.Unauthorized].code
      );
    } else {
      if (!config.ADMIN_ACCESS_SECRET) {
        throw new AppError(
          "ADMIN_ACCESS_SECRET is not defined in the config",
          500
        );
      }
      if (!config.ADMIN_REFRESH_SECRET) {
        throw new AppError(
          "ADMIN_REFRESH_SECRET is not defined in the config",
          500
        );
      }
      const accessToken = jwt.sign(
        { id: adminAccount._id, email: adminAccount.email, role: "admin" },
        config.ADMIN_ACCESS_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        {
          id: adminAccount._id,
          email: adminAccount.email,
          role: "admin",
        },
        config.ADMIN_REFRESH_SECRET,
        {
          expiresIn: "7d",
        }
      );
      // storing the hashed refresh token value to admin collection
      const updatedData = await this.AdminRepository.update(
        String(adminAccount._id),
        {
          refreshToken,
        }
      );

      return { accessToken, refreshToken };
    }
  }
  async clearRefreshToken() {
    const admin = await this.AdminRepository.findOne({});
    if (admin && admin._id) {
      await this.AdminRepository.resetRefreshToken(String(admin._id));
    } else {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }
  }
}

export default new AdminService(AdminRepository);
