import { errorMap, ErrorType } from "../../constants/response.failture";
import { IMeeting } from "../../entities/IMeeting";
import AppError from "../../errors/appError";
import MeetingRepository from "../../repositories/implementations/MeetingRepository";
import { IMeetingRepository } from "../../repositories/interface/IMeetingRepository";
import { IMeetingService } from "../interface/IMeetingService";

class MeetingService implements IMeetingService {
  private MeetingRepository: IMeetingRepository;
  constructor(MeetingRepository: IMeetingRepository) {
    this.MeetingRepository = MeetingRepository;
  }

  async createMeeting(data: IMeeting): Promise<IMeeting> {
    return await this.MeetingRepository.create(data);
  }

  async updateMeeting(data: Partial<IMeeting>): Promise<IMeeting> {
    if (!data._id) {
      throw new Error("No object id found");
    }
    const updated = await this.MeetingRepository.update("" + data._id, data);
    if (updated) {
      return updated;
    } else {
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
      );
    }
  }

  async getMeetings(spaceId: string): Promise<IMeeting[]> {
    const result = await this.MeetingRepository.findMeetingsBySpaceId(spaceId);
    return result;
  }

  async deleteMeeting(meetingId: string): Promise<IMeeting> {
    const deleted = await this.MeetingRepository.deleteMeetingByMeetingId(
      meetingId
    );
    return deleted;
  }
}

export default new MeetingService(MeetingRepository);
