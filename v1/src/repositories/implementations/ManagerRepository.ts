import { IManager } from "../../entities/IManager";
import { IManagerRepository } from "../../repositories/interface/IManagerRepository";
import { Manager } from "../../schemas/managerSchema";
import { BaseRepository } from "./BaseRepository";

class ManagerRepository
  extends BaseRepository<IManager>
  implements IManagerRepository
{
  constructor() {
    super(Manager);
  }

  async getManagers(id: string): Promise<IManager[]> {
    return this.model.find({ ownerId: id });
  }
}

export default new ManagerRepository();
