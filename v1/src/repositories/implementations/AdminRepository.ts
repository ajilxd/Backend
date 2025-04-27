import { IAdminRepository } from "../interface/IAdminRepository";
import { IAdmin } from "../../entities/IAdmin";
import { Admin } from "../../schemas/adminSchema";

import { BaseRepository } from "./BaseRepository";

class AdminRepository
  extends BaseRepository<IAdmin>
  implements IAdminRepository
{
  constructor() {
    super(Admin);
  }
}
export default new AdminRepository();
