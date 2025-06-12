import { User } from "src/http/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "../rooms/room.entity";

@Entity({ name: 'servers' })
export class ServerEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => User, (user) => user.servers)
    @JoinTable({ name: 'server_users' })
    users: User[];

    @OneToMany(() => Room, (room) => room.server)
    @JoinColumn()
    rooms: Room[];

    @ManyToMany(() => User)
    @JoinTable({ name: 'server_invites' })
    invites: User[];

    @Column({ default: "" })
    iconUrl: string;

    @ManyToOne(() => User)
    @JoinColumn()
    creator: User;

    @CreateDateColumn()
    createdAt: Date;
}