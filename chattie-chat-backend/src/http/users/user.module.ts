import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { Room } from "../rooms/room.entity";

@Module({
    imports: [TypeOrmModule.forFeature([User, Room])],
    providers: [UserService],
    exports: [UserService],
    controllers: [UserController]
})
export class UserModule { }