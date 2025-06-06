
import { INotification } from "../../entities/INotification";
import { INotificationRepository } from "../interface/INotificationRepository";
import { Notification } from "../../schemas/notificationSchema";

import { BaseRepository } from "./BaseRepository";
class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  constructor() {
    super(Notification);
  }
}

export default new NotificationRepository();
