import { IDoc } from "../../entities/IDoc";

export interface IDocumentService {
  createDocument(data: Partial<IDoc>): Promise<IDoc>;
  updateDocument(docId: string, data: Partial<IDoc>): Promise<IDoc | null>;
  getDocuments(spaceId: string): Promise<IDoc[] | null>;
  deletDocument(docId: string): Promise<IDoc>;
}
