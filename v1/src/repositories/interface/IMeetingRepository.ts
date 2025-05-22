import { IMeeting } from "../../entities/IMeeting";
import { IBaseRepository } from "./IBaserRepository";

export interface IMeetingRepository extends IBaseRepository<IMeeting> {
  findMeetingsBySpaceId(spaceId: string): Promise<IMeeting[]>;
  deleteMeetingByMeetingId(meetingId: string): Promise<IMeeting>;
}
