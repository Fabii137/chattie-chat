import { Message } from "src/http/messages/message.entity";
import { User } from "src/http/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ServerEntity } from "../servers/server.entity";

export enum RoomType {
    DM = 'dm',
    GROUP = 'group',
    SERVER = 'server'
} 

@Entity({ name: 'rooms' })
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 'New Room'})
    name: string;

    @Column({type: 'enum', enum: RoomType})
    type: RoomType;

    @OneToMany(() => Message, (message) => message.room)
    messages: Message[];

    @ManyToOne(() => ServerEntity, (server) => server.rooms, {nullable: true})
    server: ServerEntity | null;

    @ManyToMany(() => User, (user) => user.privateRooms)
    @JoinTable({ name: 'room_users' })
    users: User[];

    @ManyToOne(() => User)
    creator: User;

    @CreateDateColumn()
    createdAt: Date;
}