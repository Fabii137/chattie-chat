import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ServerEntity } from "./server.entity";
import { ServerMembership } from "src/http/serverMembership/serverMembership.entity";
import { User } from "../users/user.entity";
import { Room, RoomType } from "../rooms/room.entity";
import { allRoomRelations, allServerRelations } from "src/utils/utilts";
import { RoomService } from "../rooms/room.service";

@Injectable()
export class ServerService {
    constructor(@InjectRepository(ServerEntity) private serverRepo: Repository<ServerEntity>,
        @InjectRepository(ServerMembership) private membershipRepo: Repository<ServerMembership>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Room) private roomRepo: Repository<Room>,
        private roomService: RoomService) { }

    async getServerById(serverId: number): Promise<ServerEntity> {
        const server = await this.serverRepo.findOne({ where: { id: serverId }, relations: allServerRelations });
        if (!server) {
            throw new ConflictException("Server not found");
        }
        return server;
    }

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

    async invite(serverId: number, senderId: number, invites: number[]): Promise<void> {
        const server = await this.serverRepo.findOne({ where: { id: serverId }, relations: ["creator", "invites", "users"] });
        if (!server) {
            throw new ConflictException("Server does not exist");
        }

        if (senderId !== server.creator.id) {
            throw new UnauthorizedException("Only the creator can send invites");
        }

        const friends: User[] = await this.userRepo.find({ where: { id: In(invites) } });
        const newInvites = friends.filter(friend => 
            !server.users.some(u => u.id === friend.id) &&
            !server.invites.some(i => i.id === friend.id)
        );

        server.invites = [...server.invites, ...newInvites];

        await this.serverRepo.save(server);

        for(const friend of newInvites) {
            await this.roomService.sendServerInvite(senderId, friend.id, serverId);
        }
    }

    async joinServer(serverId: number, userId: number): Promise<ServerEntity> {
        const server = await this.serverRepo.findOne({ where: { id: serverId }, relations: ["users", "invites"] });
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

        if(!server.invites.some(u => u.id === userId)) {
            throw new UnauthorizedException("You don't have an invite to this server");
        }

        server.invites = server.invites.filter(u => u.id !== userId);

        const membership = this.membershipRepo.create({
            user,
            server
        });
        await this.membershipRepo.save(membership);

        server.users.push(user);
        const saved = await this.serverRepo.save(server);
        const savedServer = await this.serverRepo.findOne({ where: { id: saved.id }, relations: allServerRelations });
        if (!savedServer) {
            throw new UnauthorizedException("Error while loading server");
        }
        return savedServer;
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

        const server = await this.serverRepo.findOne({ where: { id: serverId }, relations: ["users", "rooms", "creator"] });
        if (!server) {
            throw new UnauthorizedException("Server not found");
        }

        if (server.creator.id !== creatorId) {
            throw new UnauthorizedException("Only the creator of the server can create rooms");
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
        const saved = await this.roomRepo.save(serverRoom);
        const savedRoom = await this.roomRepo.findOne({ where: { id: saved.id }, relations: allRoomRelations });
        if (!savedRoom) {
            throw new UnauthorizedException("Error while loading Server Room");
        }
        return savedRoom;
    }

}