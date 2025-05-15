import { IBaseRepository } from "./IBaserRepository";
import { IChat } from "../../entities/IChat";

export interface IChatRepository extends IBaseRepository<IChat> {
  findByRoomId(room: string): Promise<IChat[] | []>;
}
