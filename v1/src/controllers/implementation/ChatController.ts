import { Request, Response, NextFunction } from "express";
import { IChatService } from "../../services/interface/IChatService";
import { IChatController } from "../interface/IChatController";
import AppError from "../../errors/appError";
import { catchAsync } from "../../errors/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import ChatService from "../../services/implementation/ChatService";

class ChatController implements IChatController {
  private ChatService: IChatService;
  constructor(ChatService: IChatService) {
    this.ChatService = ChatService;
  }

  fetchChatsByRoom = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { room } = req.params;
      if (!room) {
        throw new AppError("room id is required", 400);
      }

      const result = await this.ChatService.findChatsByRoom(room);

      if (result.length > 0) {
        return sendResponse(res, 200, "Fetched chats for room " + room, result);
      } else {
        return sendResponse(res, 204);
      }
    }
  );
}

export default new ChatController(ChatService);
