import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterDto } from "src/http/dtos/register.dto";
import { LoginDto } from "src/http/dtos/login.dto";
import { SafeUser } from "../dtos/safeUser.dto";

@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get(':userId/friends')
    async getFriends(@Param('userId', ParseIntPipe) userId: number): Promise<SafeUser[]> {
        return this.userService.getFriends(userId);
    }

    @Get(':userId/friend-requests')
    async getFriendRequests(@Param('userId', ParseIntPipe) userId: number): Promise<SafeUser[]> {
        return this.userService.getFriendRequests(userId);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<SafeUser | null> {
        return this.userService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<SafeUser | null> {
        return this.userService.login(loginDto);
    }

    @Post('set-offline')
    async setOffline(@Body() userId: number): Promise<void> {
        return this.userService.setOffline(userId);
    }

    @Post('send-friend-request')
    async sendFriendRequest(@Body() body: {senderId: number, receiverName: string}): Promise<void> {
        if(!body || !body.senderId || !body.receiverName) 
            throw new BadRequestException('Missing senderId or receiverName in request body.');
        
        return this.userService.sendFriendRequest(body.senderId, body.receiverName);
    }

    @Post('accept-friend-request')
    async acceptFriendRequest(@Body() body: {senderId: number, receiverId: number}): Promise<void> {
        if(!body || !body.senderId || !body.receiverId) 
            throw new BadRequestException('Missing senderId or receiverId in request body.');
        
        return this.userService.acceptFriendRequest(body.senderId, body.receiverId);
    }

    @Post('reject-friend-request')
    async rejectFriendRequest(@Body() body: {senderId: number, receiverId: number}): Promise<void> {
        if(!body || !body.senderId || !body.receiverId) 
            throw new BadRequestException('Missing senderId or receiverId in request body.');
        
        return this.userService.rejectFriendRequest(body.senderId, body.receiverId);
    }

    @Post('delete-friend')
    async deleteFriend(@Body() body: {userId: number, friendId: number}): Promise<void> {
        if(!body || !body.userId || !body.friendId) 
            throw new BadRequestException('Missing userId or friendId in request body.');
        
        return this.userService.deleteFriend(body.userId, body.friendId);
    }
}