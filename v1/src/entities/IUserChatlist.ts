export interface IUserChatlist {
  chatId: string;
  participants: [string, string];
  createdAt?: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
}
