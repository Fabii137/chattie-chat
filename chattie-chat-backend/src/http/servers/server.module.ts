import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServerEntity } from "./server.entity";
import { ServerMembership } from "src/http/serverMembership/serverMembership.entity";
import { ServerService } from "./server.service";
import { ServerController } from "./server.controller";
import { User } from "../users/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ServerEntity, ServerMembership, User])],
    providers: [ServerService],
    exports: [ServerService],
    controllers: [ServerController]
})
export class ServerModule { }