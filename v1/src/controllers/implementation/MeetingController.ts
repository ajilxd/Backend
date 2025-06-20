import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { IMeetingService } from "../../services/interface/IMeetingService";
import { IMeetingController } from "../interface/IMeetingController";
import { IUserService } from "../../services/interface/IUserService";
import { IManagerService } from "../../services/interface/IManagerService";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../errors/catchAsyc";
import MeetingService from "../../services/implementation/MeetingService";
import UserService from "../../services/implementation/UserService";
import ManagerService from "../../services/implementation/ManagerService";
import {
  createRouter,
  createWebRtcTransport,
  removeParticipant,
  removeRouter,
  routerResources,
} from "../mediasoupHandler";
import { AppConfig } from "aws-sdk";
import AppError from "../../errors/appError";

class MeetingController implements IMeetingController {
  private MeetingService: IMeetingService;
  private UserService: IUserService;
  private ManagerService: IManagerService;
  constructor(
    MeetingService: IMeetingService,
    UserService: IUserService,
    ManagerService: IManagerService
  ) {
    this.MeetingService = MeetingService;
    this.ManagerService = ManagerService;
    this.UserService = UserService;
  }

  addMeetingHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { hostId, role, spaceId, isInstant } = req.body;
      const meetingId = uuidv4();
      let validUser;
      if (role === "manager") {
        validUser = await this.ManagerService.findManagerById(hostId);
      } else if (role === "user") {
        validUser = await this.UserService.getUserById(hostId);
      }

      if (!validUser) {
        return sendResponse(
          res,
          400,
          `No valid user found of the id -${hostId}`
        );
      }

      const SpaceMeetings = await this.MeetingService.getMeetings(spaceId);

      if (isInstant && SpaceMeetings && SpaceMeetings?.length > 0) {
        const hasActiveMeetings = SpaceMeetings.filter(
          (entry) => entry.status === "active"
        );
        if (hasActiveMeetings.length > 0) {
          return sendResponse(res, 403, "Already an active call is running");
        }
      }
      const created = await this.MeetingService.createMeeting({
        ...req.body,
        meetingId,
      });

      let rtpCapabilities;
      let sendTransport;
      let recvTransport;
      if (isInstant) {
        const router = await createRouter(meetingId);
        rtpCapabilities = router.rtpCapabilities;
        sendTransport = await createWebRtcTransport(meetingId, hostId, "send");
        recvTransport = await createWebRtcTransport(meetingId, hostId, "recv");
        const result = {
          rtpCapabilities,
          sendtransportOptions: {
            id: sendTransport.id,
            iceParameters: sendTransport.iceParameters,
            iceCandidates: sendTransport.iceCandidates,
            dtlsParameters: sendTransport.dtlsParameters,
            sctpParameters: sendTransport.sctpParameters,
          },
          recvTransportOptions: {
            id: recvTransport.id,
            iceParameters: recvTransport.iceParameters,
            iceCandidates: recvTransport.iceCandidates,
            dtlsParameters: recvTransport.dtlsParameters,
            sctpParameters: recvTransport.sctpParameters,
          },
          meeting: created,
        };

        return sendResponse(
          res,
          201,
          `Instant call has been succesfully initiated by ${hostId}`,
          result
        );
      }

      return sendResponse(
        res,
        201,
        `A meeting has succesfully scheduled`,
        created
      );
    }
  );

  updateMeetingHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { hostId, role } = req.body;
      let validUser;
      if (role === "manager") {
        validUser = await this.ManagerService.findManagerById(hostId);
      } else if (role === "user") {
        validUser = await this.UserService.getUserById(hostId);
      }

      if (!validUser) {
        return sendResponse(
          res,
          400,
          `No valid user found with this -id(${hostId})`
        );
      }

      const updated = await this.MeetingService.updateMeeting(req.body);
      return sendResponse(
        res,
        200,
        `Meeting has been succesfully updated - ${updated._id}`,
        updated
      );
    }
  );

  joinMeetingHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { joineeId, role, spaceId, meetingId } = req.body;
      let meeting;
      let validUser;
      if (role === "manager") {
        validUser = await this.ManagerService.findManagerById(joineeId);
      } else if (role === "user") {
        validUser = await this.UserService.getUserById(joineeId);
      }

      if (!validUser) {
        return sendResponse(
          res,
          400,
          `No valid user found with this id(${joineeId})`
        );
      }

      const spaceMeetings = await this.MeetingService.getMeetings(spaceId);
      if (spaceMeetings) {
        const existingMeeting = spaceMeetings.filter(
          (entry) => entry.meetingId === meetingId
        );

        if (existingMeeting.length === 0) {
          return sendResponse(
            res,
            400,
            "No actve meeting found for this space"
          );
        }
        meeting = existingMeeting[0];
      }

      let router = routerResources.get(meetingId)?.router;
      if (!router) {
        router = await createRouter(meetingId);
      }

      const rtpCapabilities = router.rtpCapabilities;
      const sendTransport = await createWebRtcTransport(
        meetingId,
        joineeId,
        "send"
      );
      const recvTransport = await createWebRtcTransport(
        meetingId,
        joineeId,
        "recv"
      );
      const meetings = await this.MeetingService.getMeetings(spaceId);
      let existingMeeting;
      if (Array.isArray(meetings)) {
        existingMeeting = meetings.filter(
          (entry) => entry.meetingId === meetingId
        )[0];
      }
      if (!existingMeeting) {
        throw new AppError(
          `No meeting found with this meeting Id ${meetingId}`,
          400,
          "warn"
        );
      }
      const { participants } = existingMeeting;
      let participantData;
      if (Array.isArray(participants) && participants.length > 0) {
        participantData = participants.filter(
          (entry) => entry.participantId === joineeId
        );
      }
      const updatedParticipantData = {
        ...participantData,
        joinedAt: new Date(),
      };
      await this.MeetingService.updateMeeting({
        _id: existingMeeting._id,
        participants: { ...participants, ...updatedParticipantData },
      });

      const result = {
        rtpCapabilities,
        sendtransportOptions: {
          id: sendTransport.id,
          iceParameters: sendTransport.iceParameters,
          iceCandidates: sendTransport.iceCandidates,
          dtlsParameters: sendTransport.dtlsParameters,
          sctpParameters: sendTransport.sctpParameters,
        },
        recvTransportOptions: {
          id: recvTransport.id,
          iceParameters: recvTransport.iceParameters,
          iceCandidates: recvTransport.iceCandidates,
          dtlsParameters: recvTransport.dtlsParameters,
          sctpParameters: recvTransport.sctpParameters,
        },
        meeting,
      };

      return sendResponse(
        res,
        200,
        "User has been succesfully joined to the meeting",
        result
      );
    }
  );

  deleteMeetingHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const meetingId = req.params.meetingId;
      const { hostId, role } = req.body;
      let validUser;
      if (role === "manager") {
        validUser = await this.ManagerService.findManagerById(hostId);
      } else if (role === "user") {
        validUser = await this.UserService.getUserById(hostId);
      }

      if (!validUser) {
        return sendResponse(res, 400, `Invalid host id spotted`);
      }

      const deleted = await this.MeetingService.deleteMeeting(meetingId);
      return sendResponse(
        res,
        200,
        `Meeting has been deleted succesfully`,
        deleted
      );
    }
  );

  fetchMeethingsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const spaceId = req.params.spaceId;
      if (!spaceId) {
        return sendResponse(
          res,
          400,
          `Space id is required for fetching meetings`
        );
      }
      const result = await this.MeetingService.getMeetings(spaceId);
      return sendResponse(
        res,
        200,
        `Succesfully fetched meetings for ${spaceId}`,
        result
      );
    }
  );

  endMeetingHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { meetingId, hostId, role, spaceId } = req.body;
      if (!meetingId || !hostId || !role || !spaceId) {
        return sendResponse(
          res,
          400,
          `MeetingId || host Id  || role || space Id are missing `
        );
      }

      let validUser;
      if (role === "manager") {
        validUser = await this.ManagerService.findManagerById(hostId);
      } else if (role === "user") {
        validUser = await this.UserService.getUserById(hostId);
      }

      if (!validUser) {
        return sendResponse(res, 404, "Invalid user");
      }
      const meetings = await this.MeetingService.getMeetings(spaceId);
      let existingMeeting;
      if (Array.isArray(meetings)) {
        existingMeeting = meetings.filter(
          (entry) => entry.meetingId === meetingId
        )[0];
      }
      if (!existingMeeting) {
        return sendResponse(
          res,
          404,
          `No meeting found with this ${meetingId}`
        );
      }
      if (existingMeeting?.hostId !== hostId) {
        return sendResponse(
          res,
          403,
          `You arent host to terminate this meeting`
        );
      }
      const updated = await this.MeetingService.updateMeeting({
        _id: existingMeeting?._id,
        meetingId,
        status: "completed",
      });
      removeRouter(meetingId);

      return sendResponse(res, 200, "Call ended successfully", updated);
    }
  );

  leaveMeetingHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId, meetingId, role, spaceId, name } = req.body;
      if (!userId || !meetingId || !role) {
        return sendResponse(
          res,
          400,
          `userId or meetingId or role is meesing  - Please try again`
        );
      }
      let validUser;
      if (role === "manager") {
        validUser = await this.ManagerService.findManagerById(userId);
      } else if (role === "user") {
        validUser = await this.UserService.getUserById(userId);
      }

      if (!validUser) {
        return sendResponse(res, 400, "Invalid user");
      }
      const meetings = await this.MeetingService.getMeetings(spaceId);
      if (!meetings) {
        throw new Error("No meetings under this space id");
      }
      let existingMeeting;
      if (Array.isArray(meetings)) {
        existingMeeting = meetings.filter(
          (entry) => entry.meetingId === meetingId
        )[0];
      }
      if (!existingMeeting) {
        throw new AppError("Invalid meeting id,No meetings found", 404, "warn");
      }
      const { participants } = existingMeeting;
      let participantData;
      if (Array.isArray(participants) && participants.length > 0) {
        participantData = participants.filter(
          (entry) => entry.participantId === userId
        );
      }
      const updatedParticipantData = { ...participantData, leftAt: new Date() };
      await this.MeetingService.updateMeeting({
        _id: existingMeeting._id,
        participants: { ...participants, ...updatedParticipantData },
      });
      removeParticipant(meetingId, userId, name);
      return sendResponse(res, 200, "leaving from meeting was succesfull");
    }
  );
}

export default new MeetingController(
  MeetingService,
  UserService,
  ManagerService
);
