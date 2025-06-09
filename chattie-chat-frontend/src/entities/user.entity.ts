import { Room } from "./room.entity";

export interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;
    friends: User[];
    incomingFriendRequests: User[];
    outgoingFriendRequests: User[];
    privateRooms: Room[];
    servers: number[];
    createdAt: Date;
    isOnline: boolean;
}