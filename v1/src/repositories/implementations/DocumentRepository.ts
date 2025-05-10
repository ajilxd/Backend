import { IDoc } from "../../entities/IDoc";
import { Doc } from "../../schemas/docSchema";
import { IDocumentRepository } from "../interface/IDocRepository";
import { BaseRepository } from "./BaseRepository";

class DocumentRepository
  extends BaseRepository<IDoc>
  implements IDocumentRepository
{
  constructor() {
    super(Doc);
  }

  async getDocumentsBySpaceId(spaceId: string): Promise<IDoc[]> {
    return await this.model.find({ spaceId });
  }

  async deleteDocument(docId: string): Promise<IDoc | null> {
    return await this.model.findByIdAndDelete(docId).exec();
  }
}

export default new DocumentRepository();
