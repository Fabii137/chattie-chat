import { Message } from "./message.entity";
import { Server } from "./server.entity";
import { User } from "./user.entity";

export interface Room {
    id?: number;
    name: string;
    type: RoomType;
    messages: Message[];
    server: Server | null;
    users: User[];
    creator: User;
    createdAt: Date;
}

export enum RoomType {
    DM = "dm",
    GROUP = "group",
    SERVER = "server",
}