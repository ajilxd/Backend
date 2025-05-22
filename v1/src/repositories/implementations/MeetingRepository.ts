import { IMeeting } from "../../entities/IMeeting";
import { IMeetingRepository } from "../interface/IMeetingRepository";
import { Meeting } from "../../schemas/meetingSchema";
import { BaseRepository } from "./BaseRepository";
import AppError from "../../errors/appError";
import { errorMap, ErrorType } from "../../constants/response.failture";
class MeetingRepository
  extends BaseRepository<IMeeting>
  implements IMeetingRepository
{
  constructor() {
    super(Meeting);
  }
  async findMeetingsBySpaceId(spaceId: string): Promise<IMeeting[]> {
    const result = await this.model.find({ spaceId });
    return result;
  }

  async deleteMeetingByMeetingId(meetingId: string): Promise<IMeeting> {
    const deleted = await this.model.findOneAndDelete({ meetingId });
    if (deleted) {
      return deleted;
    } else {
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
      );
    }
  }
}

export default new MeetingRepository();
