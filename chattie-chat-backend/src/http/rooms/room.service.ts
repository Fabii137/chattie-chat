import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Repository, In } from "typeorm";
import { Room, RoomType } from "./room.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { Message } from "../messages/message.entity";

@Injectable()
export class RoomService {
    constructor(@InjectRepository(Room) private roomRepo: Repository<Room>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Message) private messageRepo: Repository<Message>) { }

    async getRoomById(roomId: number, userId: number): Promise<Room> {
        const room = await this.roomRepo.findOne({where: {id: roomId}, relations: ["users", "messages"]});
        if(!room) {
            throw new UnauthorizedException("Room not found");
        }

        const user = await this.userRepo.findOne({where: {id: userId}});
        if(!user) {
            throw new UnauthorizedException("User not found");
        }
        console.log({room, users: room.users})
        if(!room.users.some(u => u.id === userId)) {
            throw new UnauthorizedException('User is not in this room')
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

        const matched = existingRooms.find(room => {
            return room.users.length === 2 && room.users.some(u => u.id === userAId) && room.users.some(u => u.id === userBId);
        })

        if (matched)
            return matched;

        const userA = await this.userRepo.findOneBy({ id: userAId });
        const userB = await this.userRepo.findOneBy({ id: userBId });

        if (!userA || !userB) {
            throw new UnauthorizedException("One or both users not found");
        }

        const dmRoom = this.roomRepo.create({
            type: RoomType.DM,
            name: `dm-${userA.username}-${userB.username}`, 
            users: [userA, userB],
            creator: userA
        });

        return this.roomRepo.save(dmRoom);
    }

    async createGroupRoom(name: string, creatorId: number, userIds: number[]): Promise<Room> {
        const creator = await this.userRepo.findOneBy({ id: creatorId });
        if (!creator) {
            throw new UnauthorizedException("Creator not found");
        }

        const users = await this.userRepo.findBy({ id: In(userIds) });
        if (users.length === 0) {
            throw new UnauthorizedException("No users found for the group");
        }
        if (users.some(user => user.id === creatorId)) {
            throw new ConflictException("Creator cannot be part of the group");
        }
        const groupRoom = this.roomRepo.create({
            type: RoomType.GROUP,
            name: name,
            users: [...users, creator],
            creator: creator
        });
        return this.roomRepo.save(groupRoom);
    }

    async deleteRoom(roomId: number, userId: number): Promise<void> {
        const room = await this.roomRepo.findOne({
            where: { id: roomId },
            relations: ["users"]
        });

        if (!room) {
            throw new UnauthorizedException("Room not found");
        }

        if (room.creator.id !== userId) {
            throw new UnauthorizedException("Only the creator can delete the room");
        }
        room.users = []; 
        await this.roomRepo.save(room); // removes all user relations from the room
        
        await this.roomRepo.remove(room);
    }

    async addMessage(roomId: number, senderId: number, content: string): Promise<Message> {
        const room = await this.roomRepo.findOne({where: {id: roomId}, relations: ["users", "messages"]});
        if(!room) {
            throw new UnauthorizedException("Room not found");
        }

        const sender = await this.userRepo.findOne({where: {id: senderId}});
        if(!sender) {
            throw new UnauthorizedException("User not found");
        }

        if(!room.users.some(u => u === sender)) {
            throw new UnauthorizedException("User is not this room");
        }

        const message = this.messageRepo.create({
            room,
            sender,
            content
        })

        return this.messageRepo.save(message);
    }
}