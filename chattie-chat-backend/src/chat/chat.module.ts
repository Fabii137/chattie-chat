import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { RoomModule } from "src/http/rooms/room.module";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [RoomModule, ConfigModule],
    providers: [ChatGateway]
})
export class ChatModule {}