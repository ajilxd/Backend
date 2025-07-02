import { Request, Response, NextFunction } from "express";
import CompanyService from "../../services/implementation/CompanyService";
import OwnerService from "../../services/implementation/OwnerService";
import { ICompanyService } from "../../services/interface/ICompanyService";
import { IOwnerService } from "../../services/interface/IOwnerService";
import { ICompanyController } from "../interface/ICompanyController";
import { catchAsync } from "../../errors/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import { successMap, SuccessType } from "../../constants/response.succesful";
import AppError from "../../errors/appError";
import { warn } from "console";

class CompanyController implements ICompanyController {
  private ownerservice: IOwnerService;
  private companyservice: ICompanyService;
  constructor(ownerservice: IOwnerService, companyservice: ICompanyService) {
    this.ownerservice = ownerservice;
    this.companyservice = companyservice;
  }

  registerCompanyHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const existingCompany = (
        await this.companyservice.findAllCompanies()
      ).find((i) => i.companyName === req.body.companyName);
      if (existingCompany) {
        return sendResponse(res, 409, "existing company name");
      }
      const result = await this.companyservice.createCompany(req.body);
      const updated = await this.ownerservice.updateOwner(req.body.ownerId, {
        company: {
          companyName: result.companyName,
          companyId: "" + result._id,
        },
      });
      return sendResponse(
        res,
        successMap[SuccessType.Created].code,
        successMap[SuccessType.Created].message,
        result
      );
    }
  );

  updateCompanyHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const updated = await this.companyservice.updateCompany(req.body);
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        updated
      );
    }
  );

  fetchAllCompaniesHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const companies = await this.companyservice.findAllCompanies();
      if (!companies.length) {
        return sendResponse(
          res,
          successMap[SuccessType.NoContent].code,
          successMap[SuccessType.NoContent].message
        );
      }
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        companies
      );
    }
  );

  getCompanyHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        throw new AppError(
          "Ownerid is required for fetching company details",
          400
        );
      }
      const company = await this.companyservice.findCompanyByOwnerId(id);
      console.log("company", company);
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        company
      );
    }
  );

  getCompanyMembers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        throw new AppError(
          "Company Id is required to fetch the company members",
          400,
          "warn"
        );
      }
      const members = await this.companyservice.findAllMembersByCompanyId(id);
      if (members.length > 0) {
        return sendResponse(
          res,
          200,
          `succesfully fetched members with ${id} got ${members.length} members`,
          members
        );
      } else {
        return sendResponse(res, 204, "No members found", "warn");
      }
    }
  );
}

export default new CompanyController(OwnerService, CompanyService);
