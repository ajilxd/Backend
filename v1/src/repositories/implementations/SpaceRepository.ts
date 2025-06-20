import mongoose, { Model, Types } from "mongoose";
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
  constructor(model: Model<ISpace>) {
    super(model);
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
    return await Space.findOne({
      _id: spaceId,
      "managers.managerId": new Types.ObjectId(managerId),
    }).exec();
  }

  async updateMember(
    spaceId: string,
    memberId: string,
    data: Partial<TeamMember>
  ): Promise<ISpace | null> {
    const updated = await Space.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(spaceId),
        "team.members.userId": new mongoose.Types.ObjectId(memberId),
      },
      {
        $set: {
          "team.members.$[elem].status": data.status,
        },
      },
      {
        arrayFilters: [
          { "elem.userId": new mongoose.Types.ObjectId(memberId) },
        ],
        new: true,
      }
    );

    return updated;
  }

async removeTeamMember(spaceId: string, userId: string): Promise<ISpace | null> {
  const updated = await Space.findOneAndUpdate(
    { _id: new Types.ObjectId(spaceId) },
    {
      $pull: {
        "team.members": {
          userId: new Types.ObjectId(userId),
        },
      },
    },
    { new: true }
  );

  return updated;
}


  async addMembersToSpace(spaceId: string, members: Partial<TeamMember>[]) {
    const updated = await Space.findByIdAndUpdate(
      { _id: spaceId },
      {
        $push: {
          "team.members": {
            $each: members,
          },
        },
      },
      { new: true }
    );
    if (updated) {
      return updated;
    } else {
      throw new AppError("updating members failed", 500, "error");
    }
  }
}

export default new SpaceRepository(Space);
