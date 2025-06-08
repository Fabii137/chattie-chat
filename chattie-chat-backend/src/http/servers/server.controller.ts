import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ServerService } from "./server.service";
import { ServerEntity } from "./server.entity";
import { Room } from "../rooms/room.entity";

@Controller('servers')
export class ServerController {
    constructor(private serverService: ServerService) { }

    @Post('create')
    async createServer(@Body() body: { name: string, creatorId: number, iconUrl?: string }): Promise<ServerEntity> {
        if (!body || !body.name || !body.creatorId) {
            throw new BadRequestException('Missing name or creatorId in request.');
        }
        return this.serverService.createServer(body.name, body.creatorId, body.iconUrl);
    }

    @Delete(':serverId/delete')
    async deleteServer(@Param('serverId') serverId: number, @Body() body: { userId: number }): Promise<void> {
        if (!body || !serverId || !body.userId) {
            throw new BadRequestException('Missing serverId or userId in request.');
        }
        return this.serverService.deleteServer(serverId, body.userId);
    }

    @Post(':serverId/join')
    async joinServer(@Param('serverId') serverId: number, @Body() body: { userId: number }): Promise<ServerEntity> {
        if (!body || !serverId || !body.userId) {
            throw new BadRequestException('Missing serverId or userId in request.');
        }
        return this.serverService.joinServer(serverId, body.userId);
    }

    @Post(':serverId/leave')
    async leaveServer(@Param('serverId') serverId: number, @Body() body: { userId: number }): Promise<void> {
        if (!body || serverId || !body.userId) {
            throw new BadRequestException('Missing serverId or userId in request.');
        }
        return this.serverService.leaveServer(serverId, body.userId);
    }

    @Post(':serverId/create-room')
    async createRoom(@Param('serverId') serverId: number, @Body() body: {name: string, creatorId: number}): Promise<Room> {
        if (!body || serverId || !body.creatorId) {
            throw new BadRequestException('Missing serverId, userId or name in request.');
        }
        return this.serverService.createRoom(body.name, serverId, body.creatorId);
    }
}