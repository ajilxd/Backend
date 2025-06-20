import { Request, Response, NextFunction } from "express";
import { IAdminController } from "../interface/IAdminController";
import AdminService from "../../services/implementation/AdminService";
import OwnerService from "../../services/implementation/OwnerService";
import { IOwnerService } from "../../services/interface/IOwnerService";
import { IAdminService } from "../../services/interface/IAdminService";
import { catchAsync } from "../../errors/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import { logger } from "../../utils/logger";

class AdminController implements IAdminController {
  private AdminService: IAdminService;
  private OwnerService: IOwnerService;
  constructor(AdminService: IAdminService, OwnerService: IOwnerService) {
    this.AdminService = AdminService;
    this.OwnerService = OwnerService;
  }

  loginAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      const { accessToken, refreshToken } =
        await this.AdminService.authenticateAdmin(email, password);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({ accessToken });
    }
  );

  logoutAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      res.cookie("refreshToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      await this.AdminService.clearRefreshToken();
      sendResponse(res, 200, "logout went succesfull");
    }
  );

  showOwners = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Number(req.query.page) || 1;
      const itemPerPage = Number(req.query.itemPerPage) || 5;

      const users = await this.OwnerService.getOwners();
      const totalPage = Math.ceil(users.length / itemPerPage);
      logger.info({ length: users.length, totalPage });
      const skip = (page - 1) * itemPerPage;
      const paginatedUsers = users.slice(skip, skip + itemPerPage);
      return sendResponse(res, 200, `Succesfully fetched owners`, {
        users: paginatedUsers,
        totalPage,
      });
    }
  );

  toggleOwnerStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let { id } = req.params;

      if (id) {
        const updatedOwner = await this.OwnerService.updateOwnerStatus(id);
        res.status(200).json({ status: "success", data: updatedOwner });
      }
    }
  );
}

export default new AdminController(AdminService, OwnerService);
