import { Room } from "./room.entity";
import { Server } from "./server.entity";

export interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
    friends: User[];
    incomingFriendRequests: User[];
    outgoingFriendRequests: User[];
    privateRooms: Room[];
    servers: Server[];
    createdAt: Date;
    isOnline: boolean;
}