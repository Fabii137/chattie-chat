import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ServerService } from "./server.service";
import { ServerEntity } from "./server.entity";

@Controller('servers')
export class ServerController {
    constructor(private serverService: ServerService) { }

    @Post('create')
    async createServer(@Body() body: { name: string, creatorId: number, iconUrl?: string }): Promise<ServerEntity> {
        if (!body || !body.name || !body.creatorId) {
            throw new BadRequestException('Missing name or creatorId in request body.');
        }
        return this.serverService.createServer(body.name, body.creatorId, body.iconUrl);
    }

    @Delete('delete')
    async deleteServer(@Body() body: { serverId: number, userId: number }): Promise<void> {
        if (!body || !body.serverId || !body.userId) {
            throw new BadRequestException('Missing serverId or userId in request body.');
        }
        return this.serverService.deleteServer(body.serverId, body.userId);
    }

    @Post('join')
    async joinServer(@Body() body: { serverId: number, userId: number }): Promise<ServerEntity> {
        if (!body || !body.serverId || !body.userId) {
            throw new BadRequestException('Missing serverId or userId in request body.');
        }
        return this.serverService.joinServer(body.serverId, body.userId);
    }

    @Post('leave')
    async leaveServer(@Body() body: { serverId: number, userId: number }): Promise<void> {
        if (!body || !body.serverId || !body.userId) {
            throw new BadRequestException('Missing serverId or userId in request body.');
        }
        return this.serverService.leaveServer(body.serverId, body.userId);
    }
}