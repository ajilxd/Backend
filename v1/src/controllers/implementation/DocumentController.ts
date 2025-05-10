import { Request, Response, NextFunction } from "express";
import DocumentService from "../../services/implementation/DocumentService";
import { IDocumentService } from "../../services/interface/IDocumentService";
import { IDocumentController } from "../interface/IDocumentController";
import { catchAsync } from "../../errors/catchAsyc";
import { ISpaceService } from "../../services/interface/ISpaceService";
import SpaceService from "../../services/implementation/SpaceService";
import AppError from "../../errors/appError";
import { sendResponse } from "../../utils/sendResponse";

class DocumentController implements IDocumentController {
  private DocumentService;
  private SpaceService;
  constructor(DocumentService: IDocumentService, SpaceService: ISpaceService) {
    this.DocumentService = DocumentService;
    this.SpaceService = SpaceService;
  }

  createDocumentHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { spaceId } = req.body;
      const validSpaceArray = await this.SpaceService.getSpaces({
        _id: spaceId,
      });
      if (!spaceId) {
        throw new AppError("Space id not found", 400);
      }
      if (!validSpaceArray.length) {
        throw new AppError("No space found with given space id", 404);
      }

      const result = await this.DocumentService.createDocument(req.body);
      sendResponse(res, 201, "document added succesfully", result);
    }
  );

  updateDocumentHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { docId } = req.params;
      const { spaceId } = req.body;
      if (!docId || !spaceId) {
        throw new AppError("No document id or space id found", 400);
      }

      const validDocuments = await this.DocumentService.getDocuments(spaceId);
      if (!validDocuments?.length) {
        throw new AppError("No document found with this space id ", 404);
      }

      const docExists = validDocuments.find(
        (doc) => "" + doc._id == "" + docId
      );

      if (!docExists) {
        throw new AppError("No document found with this document id", 404);
      }

      const updated = await this.DocumentService.updateDocument(
        docId,
        req.body
      );

      return sendResponse(
        res,
        200,
        "Document updation went succesfull",
        updated
      );
    }
  );

  deleteDocumentHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { docId } = req.params;
      const { spaceId } = req.body;
      if (!docId || !spaceId) {
        throw new AppError("No document id or space id found", 400);
      }

      const validDocuments = await this.DocumentService.getDocuments(spaceId);
      if (!validDocuments?.length) {
        throw new AppError("No document found with this space id ", 404);
      }

      const docExists = validDocuments.find(
        (doc) => "" + doc._id == "" + docId
      );

      if (!docExists) {
        throw new AppError("No document found with this document id", 404);
      }

      const deleted = await this.DocumentService.deletDocument(docId);
      sendResponse(res, 200, "document deleted succesfully", deleted);
    }
  );

  getDocumentsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (typeof req.query.spaceId !== "string") {
        return res.status(400).json({ error: "spaceId must be a string" });
      }
      const spaceId = req.query.spaceId;

      const validDocuments = await this.DocumentService.getDocuments(spaceId);
      console.log(validDocuments);
      if (!validDocuments?.length) {
        throw new AppError("No document found with this space id ", 404);
      }
      sendResponse(res, 200, "Fetched documents succesfully", validDocuments);
    }
  );
}

export default new DocumentController(DocumentService, SpaceService);
