import { ISpace } from "../../entities/ISpace";
import { IBaseRepository } from "./IBaserRepository";
import { TeamMember } from "../../entities/ISpace";
import { updateSpaceByQueryType } from "../../types";
import { ObjectId } from "mongoose";

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
    spaceId: ObjectId,
    memberId:ObjectId,
    data: Partial<TeamMember>
  ): Promise<ISpace | null>;

  updateSpaceByQuery(
    spaceId: string,
    updateByQuery: updateSpaceByQueryType
  ): Promise<ISpace | null>;

  addMembersToSpace(spaceId: string, members: any): Promise<ISpace>;

  removeTeamMember(spaceId: string, userId: string): Promise<ISpace | null>;
}
