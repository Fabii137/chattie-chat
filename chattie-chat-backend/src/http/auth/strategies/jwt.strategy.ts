import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../token-payload";
import { UserService } from "src/http/users/user.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService, private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request.cookies?.Authentication,
            ]),
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: TokenPayload) {
        return this.userService.getUserWithPasswordAndRefreshToken({ id: parseInt(payload.userId) });
    }
}