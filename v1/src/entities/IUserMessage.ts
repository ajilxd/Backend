export type MessageType = "text" | "image" | "audio" | "video" | "file";

export interface IMediaMeta {
  contentType?: string;
  size?: number;
  originalName?: string;
  duration?: number;
  extension?: string;
}

export interface IUserMessage {
  _id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content: string;
  mediaMeta?: IMediaMeta;
  createdAt?: Date;
  read?: boolean;
  isDeleted?: boolean;
}
