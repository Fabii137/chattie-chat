import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import { RoomService } from "./room.service";
import { Room } from "./room.entity";
import { Message } from "../messages/message.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { User } from "../users/user.entity";

@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService) { }

    @Get(':roomId')
    @UseGuards(JwtAuthGuard)
    async getRoomById(@CurrentUser() user: User, @Param('roomId', ParseIntPipe) roomId: number): Promise<Room> {
        if(!roomId) {
            throw new BadRequestException("Mising roomId in request");
        }
        return this.roomService.getRoomById(roomId, user.id);
    }

    @Post('dm/open')
    @UseGuards(JwtAuthGuard)
    async findOrCreateDMRoom(@CurrentUser() user: User, @Body() body: { userId: number }): Promise<Room> {
        if (!body || !body.userId) {
            throw new BadRequestException('Missing userId in request.');
        }
        return this.roomService.findOrCreateDMRoom(user.id, body.userId);
    }

    @Post('groups/create')
    @UseGuards(JwtAuthGuard)
    async createGroupRoom(@CurrentUser() user: User, @Body() body: {name: string, userIds: number[] }): Promise<Room> {
        if (!body || !body.name || !body.userIds || body.userIds.length === 0) {
            throw new BadRequestException('Missing name, or userIds in request.');
        }
        return this.roomService.createGroupRoom(body.name, user.id, body.userIds);
    }

    @Delete(':roomId/delete')
    @UseGuards(JwtAuthGuard)
    async deleteRoom(@CurrentUser() user: User, @Param('roomId') roomId: number): Promise<void> {
        if (!roomId) {
            throw new BadRequestException('Missing roomId in request.');
        }
        return this.roomService.deleteRoom(roomId, user.id);
    }

    @Post(':roomId/add-message')
    @UseGuards(JwtAuthGuard)
    async addMessage(@CurrentUser() user: User, @Param('roomId', ParseIntPipe) roomId: number, @Body() body: {content: string}): Promise<Message> {
        if(!body || !roomId || !body.content) {
            throw new BadRequestException("Missing roomId, senderId or content in request");
        }
        return this.roomService.addMessage(roomId, user.id, body.content);
    }
}