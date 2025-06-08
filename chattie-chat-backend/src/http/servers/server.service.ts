import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServerEntity } from "./server.entity";
import { ServerMembership } from "src/http/serverMembership/serverMembership.entity";
import { User } from "../users/user.entity";
import { Room, RoomType } from "../rooms/room.entity";

@Injectable()
export class ServerService {
    constructor(@InjectRepository(ServerEntity) private serverRepo: Repository<ServerEntity>,
        @InjectRepository(ServerMembership) private membershipRepo: Repository<ServerMembership>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Room) private roomRepo: Repository<Room>) { }

    async createServer(name: string, creatorId: number, iconUrl?: string): Promise<ServerEntity> {
        const creator = await this.userRepo.findOne({ where: { id: creatorId } });
        if (!creator) {
            throw new ConflictException("Creator not found");
        }

        const server = this.serverRepo.create({
            name,
            iconUrl,
            users: [creator],
            creator,
        });

        const savedServer = await this.serverRepo.save(server);

        const memberShip = this.membershipRepo.create({
            user: creator,
            server: savedServer
        });
        await this.membershipRepo.save(memberShip);

        return savedServer;
    }


    async deleteServer(serverId: number, userId: number): Promise<void> {
        const server = await this.serverRepo.findOne({ where: { id: serverId }, relations: ["creator"] });
        if (!server) {
            throw new ConflictException("Server not found");
        }

        if (server.creator.id !== userId) {
            throw new UnauthorizedException("Only the creator can delete the server");
        }

        this.membershipRepo.delete({ server });
        await this.serverRepo.remove(server);
    }

    async joinServer(serverId: number, userId: number): Promise<ServerEntity> {
        const server = await this.serverRepo.findOne({ where: { id: serverId }, relations: ["users"] });
        if (!server) {
            throw new ConflictException("Server not found");
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ConflictException("User not found");
        }

        if (server.users.some(u => u.id === userId)) {
            throw new ConflictException("User is already a member of the server");
        }

        const membership = this.membershipRepo.create({
            user,
            server
        });
        await this.membershipRepo.save(membership);

        server.users.push(user);
        return this.serverRepo.save(server);
    }

    async leaveServer(serverId: number, userId: number): Promise<void> {
        const server = await this.serverRepo.findOne({ where: { id: serverId }, relations: ["users", "creator"] });
        if (!server) {
            throw new ConflictException("Server not found");
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ConflictException("User not found");
        }

        if (!server.users.some(u => u.id === userId)) {
            throw new ConflictException("User is not a member of the server");
        }

        if (server.creator.id === userId) {
            throw new UnauthorizedException("The creator cannot leave the server");
        }

        await this.membershipRepo.delete({ user, server });

        server.users = server.users.filter(u => u.id !== userId);
        await this.serverRepo.save(server);
    }

    async createRoom(name: string, serverId: number, creatorId: number): Promise<Room> {
        const creator = await this.userRepo.findOneBy({ id: creatorId });
        if (!creator) {
            throw new UnauthorizedException("Creator not found");
        }

        const server = await this.serverRepo.findOne({where: { id: serverId }, relations: ["users", "rooms", "creator"]});
        if (!server) {
            throw new UnauthorizedException("Server not found");
        }

        if(server.creator !== creator) {
            throw new UnauthorizedException("Only the creator of the server can create rooms");
        }

        if (!server.users.some(u => u.id === creatorId)) {
            throw new UnauthorizedException("Creator is not a member of the server");
        }

        if (server.rooms.some(room => room.name === name)) {
            throw new ConflictException("Room with this name already exists in the server");
        }
        
        const serverRoom = this.roomRepo.create({
            type: RoomType.SERVER,
            name,
            server,
            users: [creator],
            creator: creator
        });
        return this.roomRepo.save(serverRoom);
    }

}