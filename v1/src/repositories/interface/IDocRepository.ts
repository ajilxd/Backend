import { IBaseRepository } from "./IBaserRepository";
import { IDoc } from "../../entities/IDoc";

export interface IDocumentRepository extends IBaseRepository<IDoc> {
  getDocumentsBySpaceId(spaceId: string): Promise<IDoc[]>;
  deleteDocument(docId: string): Promise<IDoc | null>;
}
