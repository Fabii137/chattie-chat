import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './http/users/user.module';
import { RoomModule } from './http/rooms/room.module';
import { ServerModule } from './http/servers/server.module';
import { MessageModule } from './http/messages/message.module';
import { ServerMembershipModule } from './http/serverMembership/serverMembership.module';
import { ChatModule } from './chat/chat.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') ?? "3306"),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        synchronize: true,
        logging: ['query', 'error'],
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    MessageModule,
    ServerMembershipModule,
    UserModule,
    RoomModule,
    ServerModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
