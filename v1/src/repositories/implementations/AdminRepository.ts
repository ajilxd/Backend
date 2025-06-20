import { IAdminRepository } from "../interface/IAdminRepository";
import { IAdmin } from "../../entities/IAdmin";
import { Admin } from "../../schemas/adminSchema";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";

class AdminRepository
  extends BaseRepository<IAdmin>
  implements IAdminRepository
{
  constructor(model: Model<IAdmin>) {
    super(model);
  }

  resetRefreshToken(id: string): Promise<IAdmin | null> {
    return this.model
      .findByIdAndUpdate(id, { refreshToken: "" }, { new: true })
      .exec();
  }
}
export default new AdminRepository(Admin);
