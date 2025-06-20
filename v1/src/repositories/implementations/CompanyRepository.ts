import { Company } from "../../schemas/companySchema";
import { ICompany } from "../../entities/ICompany";
import { ICompanyRepository } from "../interface/ICompanyRepository";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";

class CompanyRepository
  extends BaseRepository<ICompany>
  implements ICompanyRepository
{
  constructor(model: Model<ICompany>) {
    super(model);
  }
}

export default new CompanyRepository(Company);
