import { ICompany } from "../../entities/ICompany";
import { CompanyMember } from "../implementation/CompanyService";

export interface ICompanyService {
  createCompany(data: Partial<ICompany>): Promise<ICompany>;
  updateCompany(data: Partial<ICompany>): Promise<ICompany>;
  findCompanyByOwnerId(id: string): Promise<ICompany | null>;
  findAllCompanies(): Promise<ICompany[]>;
  findAllMembersByCompanyId(companyId: string): Promise<CompanyMember[]>
}
