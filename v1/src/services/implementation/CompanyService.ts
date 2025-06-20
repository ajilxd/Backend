import { errorMap, ErrorType } from "../../constants/response.failture";
import { ICompany } from "../../entities/ICompany";
import AppError from "../../errors/appError";
import CompanyRepository from "../../repositories/implementations/CompanyRepository";
import OwnerRepository from "../../repositories/implementations/OwnerRepository";
import { ICompanyRepository } from "../../repositories/interface/ICompanyRepository";
import { IOwnerRepository } from "../../repositories/interface/IOwnerRepository";
import { ICompanyService } from "../interface/ICompanyService";

class CompanyService implements ICompanyService {
  private companyrepository: ICompanyRepository;
  private ownerrepository: IOwnerRepository;
  constructor(
    companyrepository: ICompanyRepository,
    ownerrepository: IOwnerRepository
  ) {
    this.companyrepository = companyrepository;
    this.ownerrepository = ownerrepository;
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
}

export default new CompanyService(CompanyRepository, OwnerRepository);
