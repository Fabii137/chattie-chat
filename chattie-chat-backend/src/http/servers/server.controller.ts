import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { ServerService } from "./server.service";
import { ServerEntity } from "./server.entity";
import { Room } from "../rooms/room.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { User } from "../users/user.entity";

@Controller('servers')
export class ServerController {
    constructor(private serverService: ServerService) { }

    @Get(':serverId')
    @UseGuards(JwtAuthGuard)
    async getServerById(@Param('serverId', ParseIntPipe) serverId: number): Promise<ServerEntity> {
        if(!serverId) {
            throw new BadRequestException("Missing serverId in request");
        }
        return this.serverService.getServerById(serverId);
    }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createServer(@CurrentUser() user: User, @Body() body: { name: string, iconUrl?: string }): Promise<ServerEntity> {
        if (!body || !body.name) {
            throw new BadRequestException('Missing name in request.');
        }
        return this.serverService.createServer(body.name, user.id, body.iconUrl);
    }

    @Delete(':serverId/delete')
    @UseGuards(JwtAuthGuard)
    async deleteServer(@CurrentUser() user: User, @Param('serverId', ParseIntPipe) serverId: number): Promise<void> {
        if (!serverId) {
            throw new BadRequestException('Missing serverId in request.');
        }
        return this.serverService.deleteServer(serverId, user.id);
    }

    @Post(':serverId/invite')
    @UseGuards(JwtAuthGuard)
    async inviteFriends(@CurrentUser() user: User, @Param('serverId', ParseIntPipe) serverId: number, @Body() body: { invites: number[] }): Promise<void> {
        if(!body || !serverId|| !body.invites) {
            throw new BadRequestException("Mising serverId, or invites in request");
        }
        return this.serverService.invite(serverId, user.id, body.invites);
    }

    @Post(':serverId/join')
    @UseGuards(JwtAuthGuard)
    async joinServer(@CurrentUser() user: User, @Param('serverId') serverId: number): Promise<ServerEntity> {
        if (!serverId) {
            throw new BadRequestException('Missing serverId in request.');
        }
        return this.serverService.joinServer(serverId, user.id);
    }

    @Post(':serverId/leave')
    @UseGuards(JwtAuthGuard)
    async leaveServer(@CurrentUser() user: User, @Param('serverId') serverId: number): Promise<void> {
        if (!serverId) {
            throw new BadRequestException('Missing serverId in request.');
        }
        return this.serverService.leaveServer(serverId, user.id);
    }

    @Post(':serverId/create-room')
    @UseGuards(JwtAuthGuard)
    async createRoom(@CurrentUser() user: User, @Param('serverId') serverId: number, @Body() body: {name: string}): Promise<Room> {
        if (!body || !serverId) {
            throw new BadRequestException('Missing serverId or name in request.');
        }
        return this.serverService.createRoom(body.name, serverId, user.id);
    }
}