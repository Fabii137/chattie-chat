import { Room } from "./room.entity";
import { User } from "./user.entity";

export interface Message {
    id?: number;
    content: string;
    sender: User;
    room: Room;
    timestamp: Date;
}