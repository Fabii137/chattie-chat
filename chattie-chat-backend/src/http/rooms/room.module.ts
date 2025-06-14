import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Room } from "./room.entity";
import { RoomService } from "./room.service";
import { RoomController } from "./room.controller";
import { User } from "../users/user.entity";
import { Message } from "../messages/message.entity";
import { ServerEntity } from "../servers/server.entity";
import { UserModule } from "../users/user.module";

@Module({
    imports: [TypeOrmModule.forFeature([Room, User, Message, ServerEntity]), UserModule],
    providers: [RoomService],
    exports: [RoomService],
    controllers: [RoomController]
})
export class RoomModule { }