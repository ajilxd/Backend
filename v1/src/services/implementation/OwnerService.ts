import { IOwnerRepository } from "../../repositories/interface/IOwnerRepository";
import { IOwner } from "../../entities/IOwner";
import AppError from "../../errors/appError";
import { IOwnerService } from "../interface/IOwnerService";
import OwnerRepository, {
  OwnerQueryType,
} from "../../repositories/implementations/OwnerRepository";
import bcrypt from "bcryptjs";
import config from "../../config";
import jwt from "jsonwebtoken";

class OwnerService implements IOwnerService {
  private ownerRepository: IOwnerRepository;

  constructor(ownerRepository: IOwnerRepository) {
    this.ownerRepository = ownerRepository;
  }

  async createOwner(data: IOwner): Promise<IOwner> {
    const result = await this.ownerRepository.create(data);
    return result;
  }

  async checkOwner(email: string, password: string): Promise<IOwner> {
    const result = await this.ownerRepository.findOne({ email });
    if (result && (await result.comparePassword(password))) {
      return result;
    } else {
      throw new AppError("invalid credentials", 403);
    }
  }

  async findOwnerByEmail(email: string): Promise<IOwner | null> {
    const result = await this.ownerRepository.findOne({ email });
    return result;
  }

  async resetPassword(email: string, password: string): Promise<IOwner> {
    const Account = await this.findOwnerByEmail(email);
    if (Account) {
      const result = await this.ownerRepository.update("" + Account._id, {
        password,
      });
      if (!result) {
        throw new AppError(
          `Failed resetting password for ${Account.name} - ${Account._id}`,
          500,
          "error"
        );
      }
      return result;
    } else {
      throw (
        (new AppError("No owner account found with this email", 404), "warn")
      );
    }
  }

  async getOwners(): Promise<IOwner[]> {
    return await this.ownerRepository.findAll();
  }

  async updateOwnerStatus(id: string): Promise<IOwner> {
    const owner = await this.ownerRepository.findOne({ _id: id });
    if (owner) {
      const result = await this.ownerRepository.update("" + owner._id, {
        isBlocked: !owner.isBlocked,
      });
      if (result) {
        return result;
      } else {
        throw new AppError("error updating owner status", 500, "error");
      }
    } else {
      throw new AppError(
        `No owner found with this Object Id - ${id}`,
        404,
        "warn"
      );
    }
  }

  async updateOwner(id: string, ownerData: Partial<IOwner>): Promise<IOwner> {
    const owner = await this.ownerRepository.findById(id);
    if (owner) {
      const result = await this.ownerRepository.update(id, ownerData);
      if (result) {
        return result;
      } else {
        throw new AppError(`Failed updating owner for ${id}`, 500, "error");
      }
    } else {
      throw new AppError("No owner account found with this id", 404, "warn");
    }
  }

  async authenticateOwner(
    email: string,
    password?: string,
    isGoogleLogin?: boolean
  ) {
    const ownerAccount = await this.ownerRepository.findOne({ email });

    if (!ownerAccount) {
      throw new AppError(
        `No owner account found with email ${email}`,
        404,
        "warn"
      );
    }

    if (!isGoogleLogin) {
      if (!password) {
        throw new AppError("No password found", 400, "warn");
      }

      const match = await bcrypt.compare(password, ownerAccount.password);

      if (!match) {
        throw new AppError(`Invalid credentials  - ${email}`, 400, "warn");
      }

      if (!ownerAccount.isVerified) {
        throw new AppError("Email should be verified", 412, "warn");
      }

      if (ownerAccount.isBlocked) {
        throw new AppError("Your owner account has been blocked", 403, "warn");
      }
    }

    if (!config.GENERAL_ACCESS_SECRET || !config.GENERAL_REFRESH_SECRET) {
      throw new AppError(
        "No access secret or refresh secret found in the env for JWT",
        500,
        "error"
      );
    }

    const accessToken = jwt.sign(
      { id: ownerAccount._id, email: ownerAccount.email, role: "owner" },
      config.GENERAL_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: ownerAccount._id, email: ownerAccount.email, role: "owner" },
      config.GENERAL_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const updatedData = await this.ownerRepository.update(
      String(ownerAccount._id),
      { refreshToken }
    );

    if (!updatedData?.refreshToken) {
      throw new AppError("failed updating refresh token in DB", 500, "error");
    }

    return { accessToken, refreshToken, account: ownerAccount };
  }

  async fetchOwnerSubscription(ownerId: string) {
    const account = await this.ownerRepository.findOne({ _id: ownerId });
    if (!account) {
      throw new AppError(`no owner found with this id ${ownerId}`, 404, "warn");
    }
    if (account && account?.subscription) {
      return account.subscription;
    } else {
      throw new AppError(
        `No subscripition found - ${account.name} -id ${account._id} `,
        404,
        "warn"
      );
    }
  }

  async fetchOwnerById(id: string): Promise<IOwner | null> {
    const account = await this.ownerRepository.findOne({ _id: id });
    if (!account) {
      throw new AppError(`no owner account found with id - ${id}`, 404, "warn");
    }
    return account;
  }

  async getOwnersQuery(query: OwnerQueryType): Promise<IOwner[]> {
    const result = await this.ownerRepository.find(query);
    return result;
  }
}

export default new OwnerService(OwnerRepository);
