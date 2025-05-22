import { Router } from "express";

import MeetingController from "../controllers/implementation/MeetingController";

export const meetingRouter = Router();

meetingRouter.post("/", MeetingController.addMeetingHandler);
meetingRouter.put("/", MeetingController.updateMeetingHandler);
meetingRouter.get("/:spaceId", MeetingController.fetchMeethingsHandler);
meetingRouter.post("/join", MeetingController.joinMeetingHandler);
meetingRouter.delete("/:meetingId", MeetingController.deleteMeetingHandler);
meetingRouter.post("/end", MeetingController.endMeetingHandler);
meetingRouter.post("/leave", MeetingController.leaveMeetingHandler);
