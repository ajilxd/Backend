export interface IParticipantMetadata {
  name: string;
  email: string;
  role: string;
  status: string;
  lastSeen: Date;
}

export interface IUserChatlist {
  chatId: string;
  participants: [string, string]; 
  createdAt?: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
  participantsMetadata: [IParticipantMetadata, IParticipantMetadata];
}
