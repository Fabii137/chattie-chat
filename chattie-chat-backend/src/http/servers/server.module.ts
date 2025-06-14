import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServerEntity } from "./server.entity";
import { ServerMembership } from "src/http/serverMembership/serverMembership.entity";
import { ServerService } from "./server.service";
import { ServerController } from "./server.controller";
import { User } from "../users/user.entity";
import { Room } from "../rooms/room.entity";
import { RoomModule } from "../rooms/room.module";
import { UserModule } from "../users/user.module";

@Module({
    imports: [TypeOrmModule.forFeature([ServerEntity, ServerMembership, User, Room]), RoomModule, UserModule],
    providers: [ServerService],
    exports: [ServerService],
    controllers: [ServerController]
})
export class ServerModule { }