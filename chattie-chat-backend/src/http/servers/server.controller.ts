import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ServerService } from "./server.service";
import { ServerEntity } from "./server.entity";
import { Room } from "../rooms/room.entity";

@Controller('servers')
export class ServerController {
    constructor(private serverService: ServerService) { }

    @Get(':serverId')
    async getServerById(@Param('serverId', ParseIntPipe) serverId: number): Promise<ServerEntity> {
        if(!serverId) {
            throw new BadRequestException("Missing serverId in request");
        }
        return this.serverService.getServerById(serverId);
    }

    @Post('create')
    async createServer(@Body() body: { name: string, creatorId: number, iconUrl?: string }): Promise<ServerEntity> {
        if (!body || !body.name || !body.creatorId) {
            throw new BadRequestException('Missing name or creatorId in request.');
        }
        return this.serverService.createServer(body.name, body.creatorId, body.iconUrl);
    }

    @Delete(':serverId/delete')
    async deleteServer(@Param('serverId', ParseIntPipe) serverId: number, @Body() body: { userId: number }): Promise<void> {
        if (!body || !serverId || !body.userId) {
            throw new BadRequestException('Missing serverId or userId in request.');
        }
        return this.serverService.deleteServer(serverId, body.userId);
    }

    @Post(':serverId/invite')
    async inviteFriends(@Param('serverId', ParseIntPipe) serverId: number, @Body() body: { senderId: number, invites: number[] }): Promise<void> {
        if(!body || !serverId || !body.senderId || !body.invites) {
            throw new BadRequestException("Mising serverId, senderId or invites in request");
        }
        return this.serverService.invite(serverId, body.senderId, body.invites);
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
        if (!body || !serverId || !body.userId) {
            throw new BadRequestException('Missing serverId or userId in request.');
        }
        return this.serverService.leaveServer(serverId, body.userId);
    }

    @Post(':serverId/create-room')
    async createRoom(@Param('serverId') serverId: number, @Body() body: {name: string, creatorId: number}): Promise<Room> {
        if (!body || !serverId || !body.creatorId) {
            throw new BadRequestException('Missing serverId, creatorId or name in request.');
        }
        return this.serverService.createRoom(body.name, serverId, body.creatorId);
    }
}