import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterDto } from "src/http/dtos/register.dto";
import { LoginDto } from "src/http/dtos/login.dto";
import * as bcrypt from 'bcrypt';
import { SafeUser } from "src/http/dtos/safeUser.dto";
import { allUserRelations } from "src/utils/utilts";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>
    ) { }

    async getUserById(userId: number): Promise<User> {
        const user = await this.getUser({ id: userId }, allUserRelations);
        return user;
    }

    async getFriendRequests(userId: number): Promise<User[]> {
        const user = await this.getUser({ id: userId }, ['incomingFriendRequests']);
        return user.incomingFriendRequests;
    }

    async register(registerDto: RegisterDto): Promise<User> {
        const existingByEmail = await this.userRepo.findOne({ where: { email: registerDto.email } });
        if (existingByEmail) {
            throw new ConflictException('Email already in use');
        }

        const existingByUsername = await this.userRepo.findOne({ where: { username: registerDto.username } });
        if (existingByUsername) {
            throw new ConflictException('Username already taken');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.userRepo.create({
            username: registerDto.username,
            email: registerDto.email,
            password: hashedPassword,
            isOnline: true,
        });

        const savedUser = await this.userRepo.save(user);
        if (!savedUser) {
            throw new ConflictException('User registration failed');
        }
        return savedUser;
    }

    async sendFriendRequest(senderId: number, receiverName: string): Promise<void> {
        const sender = await this.getUser({ id: senderId }, ["friends", "outgoingFriendRequests"]);
        const receiver = await this.getUser({ username: receiverName }, ["friends", "incomingFriendRequests"]);

        if (sender.id === receiver.id) {
            throw new ConflictException("You cannot send a friend request to yourself");
        }

        const alreadyFriends = await this.userRepo.createQueryBuilder('user')
            .leftJoin('user.friends', 'friend')
            .where('user.id = :receiverId', { receiverId: receiver.id })
            .andWhere('friend.id = :senderId', { senderId })
            .getCount();

        if (alreadyFriends) {
            throw new ConflictException("You are already friends with this user");
        }

        const alreadyRequested = await this.userRepo.createQueryBuilder('user')
            .leftJoin('user.incomingFriendRequests', 'request')
            .where('user.id = :receiverId', { receiverId: receiver.id })
            .andWhere('request.id = :senderId', { senderId })
            .getCount();

        if (alreadyRequested) {
            throw new ConflictException("You already sent a friend request to this person");
        }

        receiver.incomingFriendRequests = receiver.incomingFriendRequests || [];
        receiver.incomingFriendRequests.push(sender);

        sender.outgoingFriendRequests = sender.outgoingFriendRequests || [];
        sender.outgoingFriendRequests.push(receiver);

        await this.userRepo.save(sender);
        await this.userRepo.save(receiver);
    }

    async acceptFriendRequest(senderId: number, receiverId: number): Promise<void> {
        const sender = await this.getUser({ id: senderId }, ["friends", "outgoingFriendRequests"]);
        const receiver = await this.getUser({ id: receiverId }, ["friends", "incomingFriendRequests"]);


        const requestExists = await this.userRepo.createQueryBuilder('user')
            .leftJoin('user.incomingFriendRequests', 'request')
            .where('user.id = :receiverId', { receiverId: receiver.id })
            .andWhere('request.id = :senderId', { senderId })
            .getCount();

        if (!requestExists) {
            throw new ConflictException("No friend request from this user");
        }

        receiver.incomingFriendRequests = receiver.incomingFriendRequests?.filter(request => request.id !== sender.id);
        sender.outgoingFriendRequests = sender.outgoingFriendRequests?.filter(request => request.id !== receiver.id);

        sender.friends = sender.friends || [];
        sender.friends.push(receiver);

        receiver.friends = receiver.friends || [];
        receiver.friends.push(sender);

        await this.userRepo.save(sender);
        await this.userRepo.save(receiver);
    }

    async rejectFriendRequest(senderId: number, receiverId: number): Promise<void> {
        const sender = await this.getUser({ id: senderId }, ["outgoingFriendRequests"]);
        const receiver = await this.getUser({ id: receiverId }, ["incomingFriendRequests"]);

        const requestExists = await this.userRepo.createQueryBuilder('user')
            .leftJoin('user.incomingFriendRequests', 'request')
            .where('user.id = :receiverId', { receiverId: receiver.id })
            .andWhere('request.id = :senderId', { senderId })
            .getCount();

        if (!requestExists) {
            throw new ConflictException("No friend request from this user");
        }

        receiver.incomingFriendRequests = receiver.incomingFriendRequests?.filter(request => request.id !== sender.id);
        sender.outgoingFriendRequests = sender.outgoingFriendRequests?.filter(request => request.id !== receiver.id);
        await this.userRepo.save(receiver);
        await this.userRepo.save(sender);
    }

    async deleteFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.getUser({ id: userId }, ["friends"]);
        const friend = await this.getUser({ id: friendId }, ["friends"]);

        if (!user.friends.some(f => f.id === friend.id)) {
            throw new ConflictException("This user is not your friend");
        }

        user.friends = user.friends?.filter(f => f.id !== friend.id);
        friend.friends = friend.friends?.filter(f => f.id !== user.id);

        await this.userRepo.save(user);
        await this.userRepo.save(friend);
    }

    async setOffline(userId: number): Promise<void> {
        await this.updateUser({ id: userId }, { isOnline: false });
    }

    async getUser(filters: { email?: string, id?: number, username?: string }, relations?: string[]): Promise<User> {
        if (!filters.email && !filters.id && !filters.username) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const user = await this.userRepo.findOne({ where: filters, relations })
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        return user;

    }

    async getUserWithPasswordAndRefreshToken(filters: { email?: string; id?: number }): Promise<User> {
        if (!filters.email && !filters.id) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const query = this.userRepo.createQueryBuilder("user").addSelect("user.password").addSelect("user.refreshToken");

        if (filters.email) {
            query.where("user.email = :email", { email: filters.email });
        } else {
            query.where("user.id = :id", { id: filters.id });
        }

        const user = await query.getOne();

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        return user;
    }

    async updateUser(filters: { email?: string; id?: number }, updateData: Partial<User>,): Promise<User> {
        if (!filters.email && !filters.id) {
            throw new UnauthorizedException("Invalid credentials");
        }

        await this.userRepo.update(filters, updateData);
        return this.getUser(filters);
    }

}