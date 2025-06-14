import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        if(err || !user) {
            if(info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException({ error: 'AccessTokenExpired', message: 'JWT access token expired'});
            }

            throw new UnauthorizedException({ error: 'Unauthorized', message: info?.message || 'Unauthorized' });
        }

        return user;
    }
}