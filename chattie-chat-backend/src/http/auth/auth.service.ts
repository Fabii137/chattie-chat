import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../users/user.service";
import * as bcrypt from 'bcrypt';
import { ConfigService } from "@nestjs/config";
import { User } from "../users/user.entity";
import { Response } from "express";
import { TokenPayload } from "./token-payload";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private configService: ConfigService
    ) { }

    async login(user: User, response: Response) {
        const expiresAccessToken = new Date();
        expiresAccessToken.setTime(
            expiresAccessToken.getTime() + parseInt(this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS')),
        );

        const expiresRefreshToken = new Date();
        expiresRefreshToken.setTime(
            expiresRefreshToken.getTime() + parseInt(this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_MS')),
        );

        const tokenPayload: TokenPayload = {
            userId: user.id.toString(),
        };

        const accessToken = this.jwtService.sign(tokenPayload, {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: `${this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
        });

        const refreshToken = this.jwtService.sign(tokenPayload, {
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
        });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userService.updateUser({ id: user.id }, { refreshToken: hashedRefreshToken });

        response.cookie('Authentication', accessToken, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            expires: expiresAccessToken,
        });

        response.cookie('Refresh', refreshToken, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            expires: expiresRefreshToken,
        })
    }

    async verifyUser(email: string, password: string) {
        try {
            const user = await this.userService.getUserWithPasswordAndRefreshToken({ email });
            const correctPassword = await bcrypt.compare(password, user.password);
            if (!correctPassword) {
                throw new UnauthorizedException();
            }
            return user;
        } catch (e) {
            throw new UnauthorizedException("Credentials not valid");
        }
    }

    async verifyUserRefreshToken(refreshToken: string, userId: string) {
        try {
            const user = await this.userService.getUserWithPasswordAndRefreshToken({ id: parseInt(userId) });
            const correctRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);
            if(!correctRefreshToken) {
                throw new UnauthorizedException();
            }
            return user;
        } catch(e) {
            throw new UnauthorizedException("Refresh token is not valid");
        }
    }
}