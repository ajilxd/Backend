import { INotification } from "../../entities/INotification";

export interface INotificationService{
    fetchNotifications(companyId:string):Promise<INotification[]>
    updateNotification(notificationIds:[string],seenId:string):Promise<void>
}