import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Repository, In } from "typeorm";
import { Room, RoomType } from "./room.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { Message, MessageType } from "../messages/message.entity";
import { allRoomRelations, allUserRelations, allMessageRelations } from "src/utils/utilts";
import { ServerEntity } from "../servers/server.entity";

@Injectable()
export class RoomService {
    constructor(
        @InjectRepository(Room) private roomRepo: Repository<Room>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Message) private messageRepo: Repository<Message>,
        @InjectRepository(ServerEntity) private serverRepo: Repository<ServerEntity>
    ) { }

    async getRoomById(roomId: number, userId: number): Promise<Room> {
        const room = await this.roomRepo.findOne({ where: { id: roomId }, relations: allRoomRelations });
        if (!room) {
            throw new ConflictException("Room not found");
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ConflictException("User not found");
        }

        if (!room.users.some(u => u.id === userId)) {
            throw new UnauthorizedException('User is not in this room');
        }

        return room;
    }

    async findOrCreateDMRoom(userAId: number, userBId: number): Promise<Room> {
        if (userAId === userBId) {
            throw new ConflictException("Cannot create a DM room with the same user");
        }

        let existingRooms = await this.roomRepo.createQueryBuilder("room")
            .leftJoinAndSelect("room.users", "user")
            .where("room.type = :type", { type: RoomType.DM })
            .andWhere("(user.id = :userAId OR user.id = :userBId)", { userAId, userBId })
            .getMany();

        const matchedRoom = existingRooms.find(room =>
            room.users.length === 2 &&
            room.users.some(u => u.id === userAId) &&
            room.users.some(u => u.id === userBId)
        );

        if (matchedRoom) {
            const loadedRoom = await this.roomRepo.findOne({ where: { id: matchedRoom.id }, relations: allRoomRelations });
            if (!loadedRoom) {
                throw new UnauthorizedException("Error while loading Room");
            }
            return loadedRoom;
        }

        const userA = await this.userRepo.findOne({ where: { id: userAId }, relations: allUserRelations });
        const userB = await this.userRepo.findOne({ where: { id: userBId }, relations: allUserRelations });

        if (!userA || !userB) {
            throw new ConflictException("One or both users not found");
        }

        const dmRoom = this.roomRepo.create({
            type: RoomType.DM,
            name: `dm-${userA.username}-${userB.username}`,
            users: [userA, userB],
            creator: userA
        });

        const saved = await this.roomRepo.save(dmRoom);
        const savedRoom = await this.roomRepo.findOne({ where: { id: saved.id }, relations: allRoomRelations });
        if (!savedRoom) {
            throw new UnauthorizedException("Error while saving Room")
        }
        return savedRoom;
    }

    async createGroupRoom(name: string, creatorId: number, userIds: number[]): Promise<Room> {
        const creator = await this.userRepo.findOne({ where: { id: creatorId }, relations: allUserRelations });
        if (!creator) {
            throw new ConflictException("Creator not found");
        }

        const users = await this.userRepo.find({ where: { id: In(userIds) }, relations: allUserRelations });
        if (users.length === 0) {
            throw new UnauthorizedException("No users found for the group");
        }

        if (users.length < 2) {
            throw new UnauthorizedException("Group needs to have at least 3 users");
        }

        if (users.some(user => user.id === creatorId)) {
            throw new ConflictException("Creator cannot be part of the group");
        }

        const groupRoom = this.roomRepo.create({
            type: RoomType.GROUP,
            name,
            users: [...users, creator],
            creator
        });

        const saved = await this.roomRepo.save(groupRoom);
        const loadedRoom = await this.roomRepo.findOne({ where: { id: saved.id }, relations: allRoomRelations });
        if (!loadedRoom) {
            throw new UnauthorizedException("Error while loading Room");
        }
        return loadedRoom;
    }

    async deleteRoom(roomId: number, userId: number): Promise<void> {
        const room = await this.roomRepo.findOne({
            where: { id: roomId },
            relations: ["users", "creator"]
        });

        if (!room) {
            throw new ConflictException("Room not found");
        } 

        if (room.creator.id !== userId) {
            throw new UnauthorizedException("Only the creator can delete the room");
        }

        room.users = [];
        await this.roomRepo.save(room);
        await this.roomRepo.remove(room);
    }

    async sendServerInvite(senderId: number, receiverId: number, serverId: number): Promise<void> {
        const dmRoom = await this.findOrCreateDMRoom(senderId, receiverId);

        const sender = await this.userRepo.findOne({ where: { id: senderId } , relations: ["friends"]});
        if (!sender) {
            throw new ConflictException("Sender not found");
        }

        if(!sender.friends.some(f => f.id === receiverId)) {
            throw new ConflictException("Invite receiver is not you friend");
        }

        const server = await this.serverRepo.findOne({ where: { id: serverId } });
        if(!server) {
            throw new ConflictException("Server not found");
        }

        const content = `You have been invited to join server: ${server.name}(${serverId})`;

        const message = this.messageRepo.create({
            room: dmRoom,
            sender,
            content,
            type: MessageType.SERVER_INVITE
        });

        await this.messageRepo.save(message);
    }

    async addMessage(roomId: number, senderId: number, content: string): Promise<Message> {
        const room = await this.roomRepo.findOne({ where: { id: roomId }, relations: ["users", "server"] });
        if (!room) {
            throw new UnauthorizedException("Room not found");
        } 

        const sender = await this.userRepo.findOne({ where: { id: senderId } });
        if (!sender) {
            throw new UnauthorizedException("User not found");
        } 

        if (!room.server && !room.users.some(u => u.id === senderId)) {
            throw new UnauthorizedException("User is not in this room");
        }

        const message = this.messageRepo.create({ room, sender, content });
        const saved = await this.messageRepo.save(message);
        const loadedMessage = await this.messageRepo.findOne({ where: { id: saved.id }, relations: allMessageRelations });
        if (!loadedMessage) {
            throw new UnauthorizedException("Error while loading message");
        }
        return loadedMessage;
    }
}
