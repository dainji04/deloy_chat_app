import { lastMessage } from "./lastMessage";
import { participant } from "./participants";

export interface conversation {
  avatar: string;
  createdAt?: Date;
  isActive?: boolean;
  isOnline?: boolean;
  lastActivity?: Date;
  lastMessage: lastMessage;
  lastSeen?: Date;
  moderator: string[];
  name: string;
  participantIds: participant[];
  type: string;
  updatedAt: Date;
  _id: string;
}