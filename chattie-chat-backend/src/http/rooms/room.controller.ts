import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { RoomService } from "./room.service";
import { Room } from "./room.entity";
import { Message } from "../messages/message.entity";

@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService) { }

    @Get(':roomId/:userId')
    async getRoomById(@Param('roomId', ParseIntPipe) roomId: number, @Param('userId', ParseIntPipe) userId: number): Promise<Room> {
        if(!roomId || !userId) {
            throw new BadRequestException("Mising roomId or userId in request");
        }
        return this.roomService.getRoomById(roomId, userId);
    }

    @Post('dm/open')
    async findOrCreateDMRoom(@Body() body: { userAId: number, userBId: number }): Promise<Room> {
        if (!body || !body.userAId || !body.userBId) {
            throw new BadRequestException('Missing userAId or userBId in request.');
        }
        return this.roomService.findOrCreateDMRoom(body.userAId, body.userBId);
    }

    @Post('groups/create')
    async createGroupRoom(@Body() body: {name: string, creatorId: number, userIds: number[] }): Promise<Room> {
        if (!body || !body.creatorId || !body.name || !body.userIds || body.userIds.length === 0) {
            throw new BadRequestException('Missing creatorId, name, or userIds in request.');
        }
        return this.roomService.createGroupRoom(body.name, body.creatorId, body.userIds);
    }

    @Delete(':roomId/delete')
    async deleteRoom(@Param('roomId') roomId: number, @Body() body: {userId: number}): Promise<void> {
        if (!body || !roomId || !body.userId) {
            throw new BadRequestException('Missing roomId or userId in request.');
        }
        return this.roomService.deleteRoom(roomId, body.userId);
    }

    @Post(':roomId/add-message')
    async addMessage(@Param('roomId', ParseIntPipe) roomId: number, @Body() body: {senderId: number, content: string}): Promise<Message> {
        if(!body || !roomId || !body.senderId || !body.content) {
            throw new BadRequestException("Missing roomId, senderId or content in request");
        }
        return this.roomService.addMessage(roomId, body.senderId, body.content);
    }
}