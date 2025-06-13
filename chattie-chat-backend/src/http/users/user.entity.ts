
import { Room } from "src/http/rooms/room.entity";
import { ServerEntity } from "src/http/servers/server.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ select: false })
    refreshToken: string;

    @Column({ nullable: true, default: "" })
    avatarUrl: string;

    @ManyToMany(() => User)
    @JoinTable({ 'name': 'user_friends' })
    friends: User[];

    @ManyToMany(() => User, (user) => user.outgoingFriendRequests)
    @JoinTable({ name: 'user_friend_requests' })
    incomingFriendRequests: User[];

    @ManyToMany(() => User, (user) => user.incomingFriendRequests)
    outgoingFriendRequests: User[];

    @Column()
    isOnline: boolean;

    @ManyToMany(() => Room, (room) => room.users)
    privateRooms: Room[];

    @ManyToMany(() => ServerEntity, (server) => server.users)
    servers: ServerEntity[];

    @CreateDateColumn()
    createdAt: Date;
}