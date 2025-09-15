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
import { plainToInstance } from "class-transformer";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { CompanyResponse } from "../../dtos/helperDtos/CompanyResponse.dto";

class CompanyController implements ICompanyController {
  private ownerservice: IOwnerService;
  private companyservice: ICompanyService;
  constructor(ownerservice: IOwnerService, companyservice: ICompanyService) {
    this.ownerservice = ownerservice;
    this.companyservice = companyservice;
  }

  registerCompany = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: ownerId } = req.user;
      const existingCompany = (
        await this.companyservice.findAllCompanies()
      ).find((i) => i.companyName === req.body.companyName);
      if (existingCompany) {
        return sendResponse(
          res,
          errorMap[ErrorType.conflict].code,
          "existing company name"
        );
      }
      const result = await this.companyservice.createCompany(req.body);
      await this.ownerservice.updateOwner(ownerId, {
        company: {
          companyName: result.companyName,
          companyId: "" + result._id,
        },
      });
      const payload = plainToInstance(CompanyResponse, result, {
        excludeExtraneousValues: true,
      });
      return sendResponse(
        res,
        successMap[SuccessType.Created].code,
        successMap[SuccessType.Created].message,
        payload
      );
    }
  );

  updateCompany = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.user;

      const updated = await this.companyservice.updateCompany(req.body, id);
      const payload = plainToInstance(CompanyResponse, updated, {
        excludeExtraneousValues: true,
      });
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        payload
      );
    }
  );

  fetchAllCompanies = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const companies = await this.companyservice.findAllCompanies();
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        companies
      );
    }
  );

  getCompany = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: ownerId } = req.user;
      const company = await this.companyservice.findCompanyByOwnerId(ownerId);
      if (!company) {
        throw new AppError(
          errorMap[ErrorType.NotFound].message,
          errorMap[ErrorType.NotFound].code
        );
      }
      const payload = plainToInstance(CompanyResponse, company, {
        excludeExtraneousValues: true,
      });
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        payload
      );
    }
  );

  getCompanyMembers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const members = await this.companyservice.findAllMembersByCompanyId(id);
      if (members.length > 0) {
        return sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message,
          members
        );
      } else {
        return sendResponse(
          res,
          successMap[SuccessType.NoContent].code,
          successMap[SuccessType.NoContent].message,
          "warn"
        );
      }
    }
  );
}

export default new CompanyController(OwnerService, CompanyService);
