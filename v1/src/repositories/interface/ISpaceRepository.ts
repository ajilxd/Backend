import { ISpace } from "../../entities/ISpace";
import { IBaseRepository } from "./IBaserRepository";
import { TeamMember } from "../../entities/ISpace";
import { updateSpaceByQueryType } from "../../types";

export interface ISpaceRepository extends IBaseRepository<ISpace> {
  getSpacesByQuery(query: {
    owner?: string;
    _id?: string;
    companyId?: string;
  }): Promise<ISpace[]>;

  getSpaceByManagerIdAndSpaceId(
    spaceId: string,
    managerId: string
  ): Promise<ISpace | null>;

  getAllSpacesByManagerId(managerId: string): Promise<ISpace[]>;

  updateMember(
    spaceId: string,
    memberId: string,
    data: Partial<TeamMember>
  ): Promise<ISpace | null>;

  updateSpaceByQuery(
    spaceId: string,
    updateByQuery: updateSpaceByQueryType
  ): Promise<ISpace | null>;
}
