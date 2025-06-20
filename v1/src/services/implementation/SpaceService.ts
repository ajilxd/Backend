import { errorMap, ErrorType } from "../../constants/response.failture";
import { ISpace, TeamMember, TeamMemberStatus } from "../../entities/ISpace";
import AppError from "../../errors/appError";
import CompanyRepository from "../../repositories/implementations/CompanyRepository";
import ManagerRepository from "../../repositories/implementations/ManagerRepository";
import OwnerRepository from "../../repositories/implementations/OwnerRepository";

import SpaceRepository from "../../repositories/implementations/SpaceRepository";
import { ICompanyRepository } from "../../repositories/interface/ICompanyRepository";

import { IManagerRepository } from "../../repositories/interface/IManagerRepository";
import { IOwnerRepository } from "../../repositories/interface/IOwnerRepository";

import { ISpaceRepository } from "../../repositories/interface/ISpaceRepository";
import { SpaceQueryType, updateSpaceByQueryType } from "../../types";

import { ISpaceService } from "../interface/ISpaceService";

type SpaceManagerType = {
  managerId: string;
  managerImage: string;
  managerName: string;
  status?: string;
};

class SpaceService implements ISpaceService {
  private SpaceRepository: ISpaceRepository;

  private ManagerRepository: IManagerRepository;

  private OwnerRepository: IOwnerRepository;

  private CompanyRepository: ICompanyRepository;

  constructor(
    SpaceRepository: ISpaceRepository,

    ManagerRepository: IManagerRepository,

    OwnerRepository: IOwnerRepository,

    CompanyRepository: ICompanyRepository
  ) {
    this.SpaceRepository = SpaceRepository;
    this.ManagerRepository = ManagerRepository;
    this.OwnerRepository = OwnerRepository;
    this.CompanyRepository = CompanyRepository;
  }

  async createSpace(owner: string, data: Partial<ISpace>): Promise<ISpace> {
    const validOwner = await this.OwnerRepository.findOne({ _id: owner });

    if (!validOwner) {
      throw new AppError(
        "No Owner account found with id - ${owner}",
        404,
        "warn"
      );
    }
    const companyData = await this.CompanyRepository.findOne({
      ownerId: validOwner._id,
    });
    if (!companyData) {
      throw new AppError("Owner havent registered a company yet", 403, "warn");
    }

    let managersData: SpaceManagerType[] = [];
    if (data.managers && data.managers.length > 0) {
      const managerPromises = data.managers.map(async (id) => {
        const manager = await this.ManagerRepository.findOne({ _id: id });
        if (!manager) {
          throw new AppError(
            "Issues at storing space at adding manager data",
            500
          );
        }
        return {
          managerId: String(manager._id),
          managerImage: manager.image ?? "",
          managerName: manager.name,
        };
      });

      managersData = await Promise.all(managerPromises);
    }

    const result = await this.SpaceRepository.create({
      ...data,
      companyName: companyData.companyName,
      companyId: companyData._id,
      managers: managersData ?? data.managers,
    });

    const updateManager = async () => {
      await Promise.all(
        managersData.map(async (i) => {
          const id = i.managerId;
          await this.ManagerRepository.update(id, {
            $addToSet: { spaces: result._id },
          });
        })
      );
    };

    await updateManager();

    if (result) {
      return result;
    } else {
      throw new AppError(
        "Failed to create space - Internal server error",
        500,
        "error"
      );
    }
  }

  async updateSpace(
    owner: string,
    spaceId: string,
    data: Partial<ISpace>
  ): Promise<ISpace> {
    const validOwner = await this.OwnerRepository.findOne({ _id: owner });
    const validSpace = await this.SpaceRepository.findOne({ _id: spaceId });
    if (!validOwner) {
      throw new AppError("Invalid ownerId", 404);
    }

    if (!validOwner) {
      throw new AppError(
        `No owner account found with this Id - ${owner}`,
        404,
        "warn"
      );
    }

    if (!validSpace) {
      throw new AppError(
        `No space found with this Id - ${spaceId}`,
        404,
        "warn"
      );
    }

    const existingManagers = validSpace.managers || [];

    if (!validSpace) {
      throw new AppError(`No space found with this id ${spaceId}`, 404, "warn");
    }

    let managersData: SpaceManagerType[];
    let updated: ISpace | null;
    if (data.managers && data.managers.length > 0) {
      const managerPromises = data.managers.map(async (item) => {
        const manager = await this.ManagerRepository.findOne({
          _id: item.managerId,
        });
        if (!manager) {
          throw new AppError(
            "Issues at storing space at adding manager data -No manager found",
            500
          );
        }
        return {
          managerId: String(manager._id),
          managerImage: manager.image ?? "",
          managerName: manager.name,
        };
      });

      managersData = await Promise.all(managerPromises);
      updated = await this.SpaceRepository.update(spaceId, {
        ...data,
        managers: managersData,
      });

      if (updated) {
        return updated;
      } else {
        throw new AppError(
          "Failed to update the space - Internal server error occured",
          500,
          "error"
        );
      }
    }

    throw new AppError(
      "No manager data provided for updating space",
      400,
      "warn"
    );
  }

  async getSpaces(query: SpaceQueryType): Promise<ISpace[]> {
    const result = await this.SpaceRepository.getSpacesByQuery(query);
    return result;
  }

  async updateSpaceQuery(
    spaceId: string,
    updateQuery: updateSpaceByQueryType
  ): Promise<ISpace> {
    if (updateQuery.managers) {
      const validManagerId = await this.ManagerRepository.findOne({
        _id: updateQuery.managers,
      });
      if (!validManagerId) {
        throw new AppError("Invalid managerId", 404);
      }
    }
    const updated = await this.SpaceRepository.updateSpaceByQuery(
      spaceId,
      updateQuery
    );
    if (updated) {
      return updated;
    } else {
      throw new AppError(
        "Failed updating space collection with query" + updateQuery,
        500
      );
    }
  }

  async addMember(
    spaceId: string,
    managerId: string,
    data: Partial<TeamMember>
  ): Promise<ISpace> {
    if (!spaceId || !managerId) {
      throw new AppError(
        `No space id or manager id provided for adding member to space`,
        400,
        "warn"
      );
    }

    const validSpaceId = await this.SpaceRepository.getSpacesByQuery({
      _id: spaceId,
    });

    if (!validSpaceId) {
      throw new AppError(
        `No space found with this space Id (${spaceId})`,
        404,
        "warn"
      );
    }

    const members = data;

    const updated = await this.SpaceRepository.addMembersToSpace(
      spaceId,
      members
    );
    if (!updated) {
      throw new AppError(
        `Failed to add member to the spaceId(${spaceId} by managerId(${managerId}))`,
        500,
        "error"
      );
    } else {
      return updated;
    }
  }

  async removeMember(
    spaceId: string,
    memberId: string,
    managerId: string
  ): Promise<ISpace> {
    if (!spaceId || !memberId || !managerId) {
      throw new AppError(
        `Bad request - spaceid or memberid or mangerId is missing`,
        400,
        "warn"
      );
    }

    const validSpace = await this.SpaceRepository.getSpacesByQuery({
      _id: "" + spaceId,
    });

    if (!validSpace) {
      throw new AppError(
        `No space found with space id(${spaceId})`,
        404,
        "warn"
      );
    }

    const validManagerId =
      await this.SpaceRepository.getSpaceByManagerIdAndSpaceId(
        "" + spaceId,
        "" + managerId
      );

    if (!validManagerId) {
      throw new AppError("Not authorized to add or edit member ", 403, "warn");
    }

    const updated = await this.SpaceRepository.removeTeamMember(
      spaceId,
      memberId
    );
    if (!updated) {
      throw new AppError(
        `Failed to update members for the space(${spaceId}) by ManagerId (${managerId})`,
        500,
        "error"
      );
    }
    return updated;
  }
}

export default new SpaceService(
  SpaceRepository,
  ManagerRepository,
  OwnerRepository,
  CompanyRepository
);
