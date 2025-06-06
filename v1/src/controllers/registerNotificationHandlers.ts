import { Namespace, Socket } from "socket.io";
import { Notification } from "../schemas/notificationSchema";

interface CustomSocket extends Socket {
  userId?: string;
  roomsJoined?: Set<string>;
}





type Consumer = {
  consumerId: string;
  consumerName: string;
  consumerImageUrl?: string;
  consumerRole?: string;
  consumerLastActive?: string;
  consumerSpaces?:string;
  socketId?:string;
};

type CompanyConsumerMapEntry = {
  consumers: Consumer[];
};

type CompanyConsumerMap = Map<string, CompanyConsumerMapEntry>;




let CompanyResources:CompanyConsumerMap = new Map()




export function registerNotificationHandlers(
  nsp: Namespace,
  socket: CustomSocket
) {
  socket.on("connect", () => {
    console.log(socket.id + "has connected to the notification system");
  });

  socket.on("user-connect",(data)=>{
    console.log("data payload from connecting notification socket",data)
    const {companyId,consumerId,} =data;
    const resources =CompanyResources.get(companyId)
    if(!resources){
      CompanyResources.set(companyId,{consumers:[{...data,socketId:socket.id}]})
    }else{
      const existing =CompanyResources.get(companyId)?.consumers.find(i=>i.consumerId===consumerId)
      if(existing){
        existing.socketId=socket.id
      }else{
        resources.consumers.push({...data,socketId:socket.id})
      }
    }
   socket.join(companyId);
   console.log(CompanyResources.get(companyId))
  })



  socket.on(
    "notification",
    async (data: {
      targetSpaceId: string;
      companyId: string;
      notificationContent: string;
      notificationType: string;
      notificationTimeStamp:string;
      storeNotificationOnDb: boolean;
    }) => {
      console.log("notification from server", data);
      if(data.storeNotificationOnDb){
        async function updateDb(){

          await Notification.create(data)
        }
       updateDb().then(()=>console.log("notification inserted to db")).catch((err)=>console.log("error happened "+err))
      }
      const {  
      companyId
    } = data;
      socket.to(companyId).emit("notification", data);
    }
    
  );

  socket.on("disconnect", () => {
    console.log(`[${socket.id}] disconnected`);
  });
}
