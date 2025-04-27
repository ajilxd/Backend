import { ICompany } from "../../entities/ICompany";

export interface ICompanyService {
  createCompany(data: Partial<ICompany>): Promise<ICompany>;
  updateCompany(data: Partial<ICompany>): Promise<ICompany>;
  findCompanyByOwnerId(id: string): Promise<ICompany | null>;
  findAllCompanies(): Promise<ICompany[]>;
}
