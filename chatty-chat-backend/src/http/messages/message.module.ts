import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./message.entity";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Message])],
    providers: [MessageService],
    exports: [MessageService],
    controllers: [MessageController]
})
export class MessageModule { }