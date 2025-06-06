
import { Room } from "src/http/rooms/room.entity";
import { ServerEntity } from "src/http/servers/server.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true})
    avatarUrl: string;

    @ManyToMany(() => Room)
    rooms: Room[];

    @ManyToMany(() => ServerEntity)
    servers: ServerEntity[];

    @CreateDateColumn()
    createdAt: Date;
}