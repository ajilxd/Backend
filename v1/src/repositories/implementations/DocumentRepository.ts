import { Model } from "mongoose";
import { IDoc } from "../../entities/IDoc";
import { Doc } from "../../schemas/docSchema";
import { IDocumentRepository } from "../interface/IDocRepository";
import { BaseRepository } from "./BaseRepository";

class DocumentRepository
  extends BaseRepository<IDoc>
  implements IDocumentRepository
{
  constructor(model: Model<IDoc>) {
    super(model);
  }

  getDocumentsBySpaceId(spaceId: string): Promise<IDoc[]> {
    return this.model.find({ spaceId });
  }

  deleteDocument(docId: string): Promise<IDoc | null> {
    return this.model.findByIdAndDelete(docId).exec();
  }
}

export default new DocumentRepository(Doc);
