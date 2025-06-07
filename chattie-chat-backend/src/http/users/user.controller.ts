import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterDto } from "src/http/dtos/register.dto";
import { LoginDto } from "src/http/dtos/login.dto";

@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.userService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.userService.login(loginDto);
    }

    @Post('set-offline')
    async setOffline(@Body('userId') userId: number) {
        return this.userService.setOffline(userId);
    }

    @Post('send-friend-request')
    async sendFriendRequest(@Body('body') body: {senderId: number, receiverName: string}) {
        if(!body.senderId || !body.receiverName) 
            throw new Error("Invalid request body");
        
        return this.userService.sendFriendRequest(body.senderId, body.receiverName);
    }

    @Post('accept-friend-request')
    async acceptFriendRequest(@Body('body') body: {senderId: number, receiverId: number}) {
        if(!body.senderId || !body.receiverId) 
            throw new Error("Invalid request body");
        
        return this.userService.acceptFriendRequest(body.senderId, body.receiverId);
    }
}