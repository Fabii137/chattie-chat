import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    afterInit(server: Server) {
        console.log('wss init');
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`client disconnected: ${client.id}`);
    }
}