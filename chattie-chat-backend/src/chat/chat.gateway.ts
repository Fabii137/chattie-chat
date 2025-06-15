import { ConfigService } from "@nestjs/config";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import * as cookie from 'cookie'
import * as jwt from 'jsonwebtoken'
import { Server, Socket } from "socket.io";
import { TokenPayload } from "src/http/auth/token-payload";
import { RoomService } from "src/http/rooms/room.service";

@WebSocketGateway({
    path: '/socket.io'
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(private roomService: RoomService, private configService: ConfigService) { }

    afterInit(server: Server) {
        console.log('wss init');
    }

    handleConnection(client: Socket, ...args: any[]) {
        try {
            const cookies = cookie.parse(client.handshake.headers.cookie || '');
            const token = cookies['Authentication'];
            
            if(!token) {
                throw new Error('No Authentication cookie');
            }

            const payload: TokenPayload = jwt.verify(token, this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET')) as TokenPayload;
            client.data.userId = parseInt(payload.userId);
        } catch(e) {
            client.disconnect();
        }
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
    async handleMessage(@MessageBody() payload: { roomId: number, message: string }, @ConnectedSocket() client: Socket) {
        try {
            const senderId = client.data.userId;
            const savedMessage = await this.roomService.addMessage(payload.roomId, senderId, payload.message);
            this.server.to(payload.roomId.toString()).emit('receive-message', savedMessage);
        } catch (error) {
            console.error('Error saving message', error)
            client.emit('error', { message: 'Failed sending message' });
        }

    }
}