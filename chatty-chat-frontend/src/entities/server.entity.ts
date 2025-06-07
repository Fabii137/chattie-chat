import { Room } from "./room.entity";
import { User } from "./user.entity";

export interface Server {
    id?: number;
    name: string;
    users: User[];
    rooms: Room[];
    iconUrl: string;
    creator: User;
    createdAt: Date;
}