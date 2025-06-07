import { Message } from "src/http/messages/message.entity";
import { User } from "src/http/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ServerEntity } from "../servers/server.entity";

@Entity({ name: 'rooms' })
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Message, (message) => message.room)
    messages: Message[];

    @ManyToOne(() => ServerEntity, (server) => server.rooms, {nullable: true})
    server: ServerEntity | null;

    @ManyToMany(() => User)
    @JoinTable({ name: 'room_users' })
    users: User[];

    @ManyToOne(() => User)
    creator: User;

    @CreateDateColumn()
    createdAt: Date;
}