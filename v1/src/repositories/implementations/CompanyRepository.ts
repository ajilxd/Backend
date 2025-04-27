import { Company } from "../../schemas/companySchema";
import { ICompany } from "../../entities/ICompany";
import { ICompanyRepository } from "../interface/ICompanyRepository";
import { BaseRepository } from "./BaseRepository";

class CompanyRepository
  extends BaseRepository<ICompany>
  implements ICompanyRepository
{
  constructor() {
    super(Company);
  }
}

export default new CompanyRepository();
