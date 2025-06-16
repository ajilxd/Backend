import { errorMap, ErrorType } from "../../constants/response.failture";
import { ISpace, TeamMember } from "../../entities/ISpace";
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
    if (!owner) {
      throw new AppError(
        "No ownerId found",
        errorMap[ErrorType.BadRequest].code
      );
    }

    const validOwner = await this.OwnerRepository.findOne({ _id: owner });

    if (!validOwner) {
      throw new AppError("Invalid owner", 404);
    }
    const companyData = await this.CompanyRepository.findOne({
      ownerId: validOwner._id,
    });
    if (!companyData) {
      throw new AppError("Owner doesnt have an company", 400);
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

    if (result) {
      return result;
    } else {
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
      );
    }
  }

  async updateSpace(
    owner: string,
    spaceId: string,
    data: Partial<ISpace>
  ): Promise<ISpace> {
    if (!owner || !spaceId) {
      throw new AppError(
        "No ownerId and spaceId found",
        errorMap[ErrorType.BadRequest].code
      );
    }
    const validOwner = await this.OwnerRepository.findOne({ _id: owner });

    if (!validOwner) {
      throw new AppError("Invalid ownerId", 404);
    }

    const validSpaceId = await this.SpaceRepository.findOne({ _id: spaceId });

    if (!validSpaceId) {
      throw new AppError("Invalid spaceId", 404);
    }

    let managersData: SpaceManagerType[];
    if (data.managers && data.managers.length > 0) {
      const managerPromises = data.managers.map(async (item) => {
        const manager = await this.ManagerRepository.findOne({
          _id: item.managerId,
        });
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

    const updated = await this.SpaceRepository.update(spaceId, {
      ...data,
      managers: managersData! || data.managers,
    });
    if (updated) {
      return updated;
    } else {
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
      );
    }
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
        errorMap[ErrorType.BadRequest].message,
        errorMap[ErrorType.BadRequest].code
      );
    }

    console.log("members from the add member service", data);

    const validSpaceId = await this.SpaceRepository.getSpacesByQuery({
      _id: spaceId,
    });

    if (!validSpaceId) {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }

    const members = data;

    // const result = await this.SpaceRepository.getSpaceByManagerIdAndSpaceId(
    //   spaceId,
    //   managerId
    // );

    // if (!result) {
    //   throw new AppError("No spaces found with managerId and spaceId", 404);
    // }

    const updated = await this.SpaceRepository.addMembersToSpace(
      spaceId,
      members
    );
    if (!updated) {
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
      );
    } else {
      return updated;
    }
  }

  async editMember(
    spaceId: string,
    memberId: string,
    managerId: string,
    data: Partial<TeamMember>
  ): Promise<ISpace> {
    if (!spaceId || !memberId || !managerId) {
      throw new AppError(
        errorMap[ErrorType.BadRequest].message,
        errorMap[ErrorType.BadRequest].code
      );
    }

    const validSpaceId = await this.SpaceRepository.getSpacesByQuery({
      _id: spaceId,
    });

    if (!validSpaceId) {
      throw new AppError(
        "No space found with space id",
        errorMap[ErrorType.NotFound].code
      );
    }

    const validManagerId =
      await this.SpaceRepository.getSpaceByManagerIdAndSpaceId(
        spaceId,
        managerId
      );

    if (!validManagerId) {
      throw new AppError("No space found with manager id", 404);
    }

    const updated = await this.SpaceRepository.updateMember(
      spaceId,
      memberId,
      data
    );
    if (!updated) {
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
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
