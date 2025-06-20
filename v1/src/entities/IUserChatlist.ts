export interface IParticipant {
  userId: string;
  name: string;
  image: string;
}

export interface IUserChatlist {
  chatId: string;
  participants: [IParticipant, IParticipant];
  createdAt?: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
}
