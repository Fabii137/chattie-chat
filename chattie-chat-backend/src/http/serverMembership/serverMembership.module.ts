import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServerMembership } from "./serverMembership.entity";
import { ServerMembershipService } from "./serverMembership.service";
import { ServerMembershipController } from "./serverMembership.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ServerMembership])],
    providers: [ServerMembershipService],
    exports: [ServerMembershipService],
    controllers: [ServerMembershipController]
})
export class ServerMembershipModule { }