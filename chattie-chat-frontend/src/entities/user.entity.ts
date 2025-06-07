export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string;
    avatarUrl: string;
    friends: User[];
    incomingFriendRequests: User[];
    outgoingFriendRequests: User[];
    privateRooms: number[];
    servers: number[];
    createdAt: Date;
    isOnline: boolean;
}