import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { User } from "../users/user.entity";
import { Response } from 'express'
import { AuthService } from "./auth.service";
import { JwtRefreshAuthGuard } from "./guards/jwt-refresh-auth.guard";
import { UserService } from "../users/user.service";
import { RegisterDto } from "../dtos/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService) { }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(
        @CurrentUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ): Promise<User> {
        await this.authService.login(user, response);
        await this.userService.updateUser({ id: user.id }, { isOnline: true });
        const fullUser = await this.userService.getUserById(user.id);
        return fullUser;
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response): Promise<User> {
        const user = await this.userService.register(registerDto);
        await this.authService.login(user, response);
        const fullUser = await this.userService.getUserById(user.id);
        return fullUser;
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
        await this.userService.updateUser({ id: user.id }, { isOnline: false });
        res.clearCookie('Authentication');
        res.clearCookie('Refresh');

    }

    @Post('refresh')
    @UseGuards(JwtRefreshAuthGuard)
    async refreshToken(
        @CurrentUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.login(user, response);
    }
}