import { ISpace } from "../../entities/ISpace";
import { Space } from "../../schemas/spaceSchema";
import { ISpaceRepository } from "../interface/ISpaceRepository";
import { BaseRepository } from "./BaseRepository";

class SpaceRepository
  extends BaseRepository<ISpace>
  implements ISpaceRepository
{
  constructor() {
    super(Space);
  }
}

export default new SpaceRepository();
