import mongoose, { ObjectId } from "mongoose";
import { ISpace, TeamMember } from "../../entities/ISpace";
import AppError from "../../errors/appError";
import { Space } from "../../schemas/spaceSchema";
import { ISpaceRepository } from "../interface/ISpaceRepository";
import { BaseRepository } from "./BaseRepository";
import { SpaceQueryType, updateSpaceByQueryType } from "../../types";

class SpaceRepository
  extends BaseRepository<ISpace>
  implements ISpaceRepository
{
  constructor() {
    super(Space);
  }

  async getSpacesByQuery(query: SpaceQueryType): Promise<ISpace[]> {
    const result = await Space.find(query);
    if (!result.length) {
      throw new AppError("No space found", 404);
    }
    return result;
  }

  async updateSpaceByQuery(
    spaceId: string,
    updateByQuery: updateSpaceByQueryType
  ): Promise<ISpace> {
    const updated = await Space.findOneAndUpdate(
      { _id: spaceId },
      updateByQuery,
      { new: true }
    );

    return updated!;
  }

  async getAllSpacesByManagerId(managerId: string): Promise<ISpace[]> {
    const result = await Space.find({ managers: managerId });
    return result;
  }

  async getSpaceByManagerIdAndSpaceId(
    spaceId: string,
    managerId: string
  ): Promise<ISpace | null> {
    const result = await Space.findOne({
      _id: spaceId,
      managers: managerId,
    }).exec();

    return result;
  }

  async updateMember(
    spaceId: ObjectId,
    memberId: ObjectId,
    data: Partial<TeamMember>
  ): Promise<ISpace | null> {
    const updated = await Space.findOneAndUpdate(
      { _id: spaceId, "team.members.userId": memberId },
      {
        $set: {
          "team.members.$[elem].role": data.role,
          "team.members.$[elem].designation": data.designation,
          "team.members.$[elem].status": data.status,
        },
      },
      {
        arrayFilters: [
          { "elem.userId":memberId},
        ],
        new: true,
      }
    );

    return updated;
  }


   async addMembersToSpace(spaceId:string,members: Partial<TeamMember>[]){
    console.log("heyyyyyyy im add member from space repo",members)
    const updated = await Space.findByIdAndUpdate({_id:spaceId},{$push:{
      "team.members":{
        $each:members
      }
    }},{new:true})
    if(updated){
      return updated
    }else{
      throw new AppError("updating members failed",500)
    }
  }
}

export default new SpaceRepository();
