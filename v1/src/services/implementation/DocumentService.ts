import { IDoc } from "../../entities/IDoc";
import AppError from "../../errors/appError";
import DocumentRepository from "../../repositories/implementations/DocumentRepository";
import { IDocumentRepository } from "../../repositories/interface/IDocRepository";
import { IDocumentService } from "../interface/IDocumentService";

class DocumentService implements IDocumentService {
  private DocumentRepository: IDocumentRepository;
  constructor(DocumentRepository: IDocumentRepository) {
    this.DocumentRepository = DocumentRepository;
  }

  async createDocument(data: Partial<IDoc>): Promise<IDoc> {
    const result = await this.DocumentRepository.create(data);
    if (result) {
      return result;
    } else {
      throw new AppError("Failed creating document", 500, "error");
    }
  }

  async updateDocument(
    docId: string,
    data: Partial<IDoc>
  ): Promise<IDoc | null> {
    const updated = await this.DocumentRepository.update(docId, data);
    if (updated) {
      return updated;
    } else {
      throw new AppError("Failed updating document", 500, "error");
    }
  }

  async getDocuments(spaceId: string): Promise<IDoc[] | null> {
    const result = await this.DocumentRepository.getDocumentsBySpaceId(spaceId);
    if (result.length > 0) {
      return result;
    } else {
      throw new AppError("Documents not found", 404, "warn");
    }
  }

  async deletDocument(docId: string): Promise<IDoc> {
    const result = await this.DocumentRepository.deleteDocument(docId);
    if (result) {
      return result;
    } else {
      throw new AppError("Failed deleting document", 500, "error");
    }
  }
}

export default new DocumentService(DocumentRepository);
