import { Router } from "express";
import DocumentController from "../controllers/implementation/DocumentController";

export const documentRouter = Router();

documentRouter.post("/", DocumentController.createDocumentHandler);
documentRouter.put("/:docId", DocumentController.updateDocumentHandler);
documentRouter.get("/", DocumentController.getDocumentsHandler);
documentRouter.delete("/:docId", DocumentController.deleteDocumentHandler);
