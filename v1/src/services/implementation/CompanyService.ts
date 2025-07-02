import { errorMap, ErrorType } from "../../constants/response.failture";
import { ICompany } from "../../entities/ICompany";
import AppError from "../../errors/appError";
import CompanyRepository from "../../repositories/implementations/CompanyRepository";
import ManagerRepository from "../../repositories/implementations/ManagerRepository";
import OwnerRepository from "../../repositories/implementations/OwnerRepository";
import UserRepository from "../../repositories/implementations/UserRepository";
import { ICompanyRepository } from "../../repositories/interface/ICompanyRepository";
import { IManagerRepository } from "../../repositories/interface/IManagerRepository";
import { IOwnerRepository } from "../../repositories/interface/IOwnerRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { ICompanyService } from "../interface/ICompanyService";

export type CompanyMember = {
  name: string;
  role: string;
  userId: string;
  image: string;
  companyId: string;
  joinedDate?: string;
  blocked?: string;
};

class CompanyService implements ICompanyService {
  private companyrepository: ICompanyRepository;
  private ownerrepository: IOwnerRepository;
  private userrepostiory: IUserRepository;
  private managerreposiory: IManagerRepository;
  constructor(
    companyrepository: ICompanyRepository,
    ownerrepository: IOwnerRepository,
    userrepository: IUserRepository,
    managerrepository: IManagerRepository
  ) {
    this.companyrepository = companyrepository;
    this.ownerrepository = ownerrepository;
    this.userrepostiory = userrepository;
    this.managerreposiory = managerrepository;
  }

  async createCompany(data: Partial<ICompany>): Promise<ICompany> {
    const { ownerId } = data;

    const validOwnerId = await this.ownerrepository.findOne({ _id: ownerId });
    if (!validOwnerId) {
      throw new AppError(
        `No owner Account fount with this ownerId - ${ownerId}`,
        404,
        "warn"
      );
    }
    const createdDoc = await this.companyrepository.create(data);
    if (createdDoc) {
      return createdDoc;
    } else {
      throw new AppError("Failed creating company document", 500, "error");
    }
  }

  async updateCompany(data: Partial<ICompany>): Promise<ICompany> {
    const { ownerId } = data;

    if (!ownerId) {
      throw new AppError(
        "Owner id is required for updating the Company document",
        400,
        "warn"
      );
    }
    const validOwnerId = await this.ownerrepository.findOne({ _id: ownerId });
    if (!validOwnerId) {
      throw new AppError(`No owner Account found with this Id ${ownerId}`, 404);
    }
    const updatedDoc = await this.companyrepository.update("" + data._id, data);

    if (updatedDoc) {
      return updatedDoc;
    } else {
      throw new AppError(
        `Failed to update company document - ownerId (${ownerId}) companyId)`,
        errorMap[ErrorType.ServerError].code
      );
    }
  }

  async findCompanyByOwnerId(id: string): Promise<ICompany | null> {
    if (!id) {
      throw new AppError("ownerid is required", 400, "warn");
    }
    const result = await this.companyrepository.findOne({ ownerId: id });
    if (result) {
      return result;
    } else {
      throw new AppError(
        `No company found with this ownerId - ${id}`,
        404,
        "warn"
      );
    }
  }

  async findAllCompanies(): Promise<ICompany[]> {
    const companies = await this.companyrepository.findAll();
    if (companies.length) {
      return companies;
    } else {
      return [];
    }
  }

  async findAllMembersByCompanyId(companyId: string): Promise<CompanyMember[]> {
    const managers = await this.managerreposiory.find({ companyId });
    const users = await this.userrepostiory.find({ companyId });
    let members: CompanyMember[] = [];
    for (let i of managers) {
      members.push({
        name: i.name,
        role: "manager",
        userId: "" + i._id,
        joinedDate: i.createdAt.toLocaleDateString(),
        image: i.image || "",
        companyId,
      });
    }
    for (let i of users) {
      members.push({
        name: i.name,
        role: "user",
        userId: "" + i._id,
        joinedDate: i.createdAt
          ? i.createdAt.toLocaleDateString()
          : "" + new Date(),
        image: i.image || "",
        companyId,
      });
    }
    return members;
  }
}

export default new CompanyService(
  CompanyRepository,
  OwnerRepository,
  UserRepository,
  ManagerRepository
);
