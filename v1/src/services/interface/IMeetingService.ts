import { IMeeting } from "../../entities/IMeeting";

export interface IMeetingService {
  createMeeting(data: IMeeting): Promise<IMeeting>;
  updateMeeting(data: Partial<IMeeting>): Promise<IMeeting>;
  getMeetings(spaceId: string): Promise<IMeeting[] | null>;
  deleteMeeting(MeetingId: string): Promise<IMeeting>;
}
