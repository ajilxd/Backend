import { Request, Response, NextFunction } from "express";
import { IAdminController } from "../interface/IAdminController";
import AdminService from "../../services/implementation/AdminService";
import OwnerService from "../../services/implementation/OwnerService";
import { IOwnerService } from "../../services/interface/IOwnerService";
import { IAdminService } from "../../services/interface/IAdminService";
import { catchAsync } from "../../errors/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import { logger } from "../../utils/logger";
import { IManagerService } from "../../services/interface/IManagerService";
import { IUserService } from "../../services/interface/IUserService";
import ManagerService from "../../services/implementation/ManagerService";
import UserService from "../../services/implementation/UserService";
import { AccountType } from "../../types";

class AdminController implements IAdminController {
  private AdminService: IAdminService;
  private OwnerService: IOwnerService;
  private ManagerService: IManagerService;
  private UserService: IUserService;
  constructor(
    AdminService: IAdminService,
    OwnerService: IOwnerService,
    ManagerService: IManagerService,
    UserService: IUserService
  ) {
    this.AdminService = AdminService;
    this.OwnerService = OwnerService;
    this.ManagerService = ManagerService;
    this.UserService = UserService;
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

  fetchAllusersHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let owners = await this.OwnerService.getOwners();
      let managers = await this.ManagerService.getAllManagers();
      let users = await this.UserService.getUsers();
      let accounts: AccountType[] = [];
      owners.map((i) => {
        accounts.push({
          role: "user",
          name: i.name,
          image: i.image,
          userId: "" + i._id,
          company: i.company.companyName,
          status: i.isBlocked ? "inactive" : "active",
          joinedAt: i.createdAt,
        });
      });
      users.map((i) => {
        accounts.push({
          role: "user",
          name: i.name,
          image: i.image!,
          userId: "" + i._id,
          company: i.companyName,
          status: i.isBlocked ? "inactive" : "active",
          joinedAt: i.createdAt,
        });
      });
      managers.map((i) => {
        accounts.push({
          role: "manager",
          name: i.name,
          image: i.image!,
          userId: "" + i._id,
          company: i.companyName,
          status: i.isBlocked ? "inactive" : "active",
          joinedAt: i.createdAt,
        });
      });
      sendResponse(res, 200, "Succesfully fetched all users", accounts);
    }
  );
}

export default new AdminController(
  AdminService,
  OwnerService,
  ManagerService,
  UserService
);
