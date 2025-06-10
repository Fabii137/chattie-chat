import { Room } from "src/http/rooms/room.entity";
import { ServerEntity } from "src/http/servers/server.entity";
import { User } from "src/http/users/user.entity";

export interface SafeUser {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
  isOnline: boolean;
  friends: User[];
  incomingFriendRequests: User[];
  outgoingFriendRequests: User[];
  privateRooms: Room[];
  servers: ServerEntity[];
  createdAt: Date;
}