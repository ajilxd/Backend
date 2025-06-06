import { INotification } from "../../entities/INotification";
import NotificationRepository from "../../repositories/implementations/NotificationRepository";
import { INotificationRepository } from "../../repositories/interface/INotificationRepository";
import { INotificationService } from "../interface/INotificationService";

class NotificationService implements INotificationService{
    private NotificationRepository:INotificationRepository;
    constructor(NotificationRepository:INotificationRepository){
        this.NotificationRepository =NotificationRepository
    }

    async fetchNotifications(companyId: string): Promise<INotification[]> {
    const notifications = await  this.NotificationRepository.findAll();
    const result =notifications.filter(item=>item.companyId ===companyId)
    return result
    }

  
     async updateNotification(notificationIds: string[], seenId: string): Promise<void> {
    for (const id of notificationIds) {
        await this.NotificationRepository.update(id, {
            $addToSet: { seenSet: seenId }
        });
    }
    }

}



export default new NotificationService(NotificationRepository)