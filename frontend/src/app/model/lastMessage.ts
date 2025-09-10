import { contentMessage } from "./contentMessage";

export interface lastMessage {
  content: contentMessage;
  createdAt: Date;
  sender: string;
  _id: string;
}