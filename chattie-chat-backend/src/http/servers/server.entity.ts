import { User } from "src/http/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "../rooms/room.entity";

@Entity({ name: 'servers' })
export class ServerEntity {
    constructor() {
        this.users = [];
        this.rooms = [];
    }
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => User)
    @JoinTable({ name: 'server_users' })
    users: User[];

    @OneToMany(() => Room, (room) => room.server)
    @JoinColumn()
    rooms: Room[];

    @Column()
    iconUrl: string;

    @ManyToOne(() => User)
    @JoinColumn()
    creator: User;

    @CreateDateColumn()
    createdAt: Date;
}