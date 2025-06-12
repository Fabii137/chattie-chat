import { Room } from "./room.entity";
import { User } from "./user.entity";

export enum MessageType {
    TEXT = "TEXT",
    SERVER_INVITE = "SERVER_INVITE",
    IMAGE = "IMAGE"
}

export interface Message {
    id?: number;
    content: string;
    type: MessageType;
    sender: User;
    room: Room;
    timestamp: Date;
}