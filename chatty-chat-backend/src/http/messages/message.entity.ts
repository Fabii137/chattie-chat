import { Room } from "src/http/rooms/room.entity";
import { User } from "src/http/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'messages' })
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'content' })
    content: string;

    @ManyToOne(() => User)
    @JoinColumn()
    sender: User;

    @ManyToOne(() => Room, (room) => room.messages)
    @JoinColumn()
    room: Room;

    @CreateDateColumn()
    timestamp: Date;

}