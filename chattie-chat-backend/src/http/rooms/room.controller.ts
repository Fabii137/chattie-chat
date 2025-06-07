import { BadRequestException, Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { RoomService } from "./room.service";
import { Room } from "./room.entity";

@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService) { }

    @Post('open-dm')
    async findOrCreateDMRoom(@Body() body: { userAId: number, userBId: number }): Promise<Room> {
        if (!body || !body.userAId || !body.userBId) {
            throw new BadRequestException('Missing userAId or userBId in request body.');
        }
        return this.roomService.findOrCreateDMRoom(body.userAId, body.userBId);
    }

    @Post('create-group')
    async createGroupRoom(@Body() body: {name: string, creatorId: number, userIds: number[] }): Promise<Room> {
        if (!body || !body.creatorId || !body.name || !body.userIds || body.userIds.length === 0) {
            throw new BadRequestException('Missing creatorId, name, or userIds in request body.');
        }
        return this.roomService.createGroupRoom(body.name, body.creatorId, body.userIds);
    }

    @Delete('delete')
    async deleteRoom(@Body() body: {roomId: number, userId: number}): Promise<void> {
        if (!body || !body.roomId || !body.userId) {
            throw new BadRequestException('Missing roomId or userId in request body.');
        }
        return this.roomService.deleteRoom(body.roomId, body.userId);
    }
}