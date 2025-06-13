import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getUserById(@CurrentUser() user: User): Promise<User> {
        return this.userService.getUserById(user.id);
    }

    @Get('friend-requests')
    @UseGuards(JwtAuthGuard)
    async getFriendRequests(@CurrentUser() user: User): Promise<User[]> {
        return this.userService.getFriendRequests(user.id);
    }

    @Post('set-offline')
    @UseGuards(JwtAuthGuard)
    async setOffline(@CurrentUser() user: User): Promise<void> {            
        return this.userService.setOffline(user.id);
    }

    @Post('send-friend-request')
    @UseGuards(JwtAuthGuard)
    async sendFriendRequest(@CurrentUser() user: User, @Body() body: {receiverName: string}): Promise<void> {
        if(!body || !body.receiverName) 
            throw new BadRequestException('Missing receiverName in request.');
        
        return this.userService.sendFriendRequest(user.id, body.receiverName);
    }

    @Post('accept-friend-request')
    @UseGuards(JwtAuthGuard)
    async acceptFriendRequest(@CurrentUser() user: User, @Body() body: {senderId: number}): Promise<void> {
        if(!body || !body.senderId) 
            throw new BadRequestException('Missing senderId in request body.');
        
        return this.userService.acceptFriendRequest(body.senderId, user.id);
    }

    @Post('reject-friend-request')
    @UseGuards(JwtAuthGuard)
    async rejectFriendRequest(@CurrentUser() user: User, @Body() body: {senderId: number}): Promise<void> {
        if(!body || !body.senderId) 
            throw new BadRequestException('Missing senderId in request body.');
        
        return this.userService.rejectFriendRequest(body.senderId, user.id);
    }

    @Post('delete-friend')
    @UseGuards(JwtAuthGuard)
    async deleteFriend( @CurrentUser() user: User, @Body() body: {friendId: number}): Promise<void> {
        if(!body || !body.friendId) 
            throw new BadRequestException('Missing friendId in request body.');
        
        return this.userService.deleteFriend(user.id, body.friendId);
    }
}