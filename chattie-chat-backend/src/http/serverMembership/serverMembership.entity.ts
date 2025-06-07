import { ServerEntity } from "src/http/servers/server.entity";
import { User } from "src/http/users/user.entity";
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'server_memberships' })
export class ServerMembership {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => ServerEntity)
    server: ServerEntity;

    @CreateDateColumn()
    joinedAt: Date;
}