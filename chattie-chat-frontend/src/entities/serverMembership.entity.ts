import { Server } from "./server.entity";
import { User } from "./user.entity";

export interface ServerMembership {
    id?: number;
    user: User;
    server: Server;
    joinedAt: Date;
}