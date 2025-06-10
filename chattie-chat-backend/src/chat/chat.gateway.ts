import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomService } from "src/http/rooms/room.service";

@WebSocketGateway({
    path: '/socket.io'
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(private roomService: RoomService) { }

    afterInit(server: Server) {
        console.log('wss init');
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(@MessageBody() roomId: number, @ConnectedSocket() client: Socket) {
        client.join(roomId.toString());
        console.log(`Client ${client.id} joined room ${roomId}`)
    }

    @SubscribeMessage('send-message')
    async handleMessage(@MessageBody() payload: { roomId: number, senderId: number, message: string }, @ConnectedSocket() client: Socket) {
        try {
            const savedMessage = await this.roomService.addMessage(payload.roomId, payload.senderId, payload.message);
            this.server.to(payload.roomId.toString()).emit('receive-message', savedMessage);
        } catch (error) {
            console.error('Error saving message', error)
            client.emit('error', { message: 'Failed sending message' });
        }

    }
}