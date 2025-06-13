import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../token-payload";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private configService: ConfigService, private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request.cookies?.Refresh,
            ]),
            secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: TokenPayload) {
        return this.authService.verifyUserRefreshToken(request.cookies?.Refresh, payload.userId);
    }
}