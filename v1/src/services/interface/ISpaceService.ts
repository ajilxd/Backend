import { ISpace, TeamMember } from "../../entities/ISpace";

import { SpaceQueryType, updateSpaceByQueryType } from "../../types";

export interface ISpaceService {
  createSpace(owner: string, data: Partial<ISpace>): Promise<ISpace>;
  updateSpace(
    owner: string,
    spaceId: string,
    data: Partial<ISpace>
  ): Promise<ISpace>;
  getSpaces(query: SpaceQueryType): Promise<ISpace[]>;
  addMember(
    spaceId: string,
    managerId: string,
    data: Partial<TeamMember>
  ): Promise<ISpace>;
  removeMember(
    spaceId: string,
    memberId: string,
    managerId: string
  ): Promise<ISpace>;

  updateSpaceQuery(
    spaceId: string,
    updateQuery: updateSpaceByQueryType
  ): Promise<ISpace>;
}
