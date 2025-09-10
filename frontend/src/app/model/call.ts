export interface IncomingCallData {
  roomId: string;
  user: User;
}

interface User {
  username: string;
  avatar: string;
  firstName: string;
  lastName: string;
}