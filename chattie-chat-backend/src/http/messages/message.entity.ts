import { Room } from "src/http/rooms/room.entity";
import { User } from "src/http/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum MessageType {
    TEXT = 'TEXT',
    SERVER_INVITE = 'SERVER_INVITE',
    IMAGE = 'IMAGE'
}

@Entity({ name: 'messages' })
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column({ default: MessageType.TEXT })
    type: MessageType;

    @ManyToOne(() => User)
    @JoinColumn()
    sender: User;

    @ManyToOne(() => Room, (room) => room.messages)
    @JoinColumn()
    room: Room;

    @CreateDateColumn()
    timestamp: Date;

}