import { Message } from "./message.entity";
import { Server } from "./server.entity";
import { User } from "./user.entity";

export interface Room {
    id?: number;
    name: string;
    messages: Message[];
    server: Server | null;
    users: User[];
    creator: User;
    createdAt: Date;
}