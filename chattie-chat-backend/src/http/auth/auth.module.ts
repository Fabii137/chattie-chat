import { Module } from "@nestjs/common";
import { UserModule } from "../users/user.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { AuthController } from "./auth.controller";
import { ConfigModule } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";

@Module({
    imports: [UserModule, PassportModule, JwtModule, ConfigModule],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
    exports: [AuthService]
})
export class AuthModule {

}