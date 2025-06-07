import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterDto } from "src/http/dtos/register.dto";
import { LoginDto } from "src/http/dtos/login.dto";
import * as bcrypt from 'bcrypt';
import { SafeUser } from "src/http/dtos/safeUser.dto";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

    async getFriends(userId: number): Promise<SafeUser[]> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['friends']
        });

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        return user.friends.map(friend => {
            const { password, ...safeFriend } = friend;
            return safeFriend;
        });
    }

    async getFriendRequests(userId: number): Promise<SafeUser[]> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['incomingFriendRequests']
        });

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        return user.incomingFriendRequests.map(request => {
            const { password, ...safeRequest } = request;
            return safeRequest;
        });
    }

    async register(registerDto: RegisterDto): Promise<SafeUser | null> {
        const existingByEmail = await this.userRepo.findOne({ where: { email: registerDto.email } });
        if (existingByEmail) 
            throw new ConflictException('Email already in use');

        const existingByUsername = await this.userRepo.findOne({ where: { username: registerDto.username } });
        if (existingByUsername) 
            throw new ConflictException('Username already taken');

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.userRepo.create({
            username: registerDto.username,
            email: registerDto.email,
            password: hashedPassword,
            isOnline: true,
        });

        const savedUser = await this.userRepo.save(user);

        const { password, ...safeUser } = savedUser;
        return safeUser;
    }


    async login(loginDto: LoginDto): Promise<SafeUser | null> {
        const user = await this.userRepo.findOne({ where: { email: loginDto.email } });

        if (!user) {
            throw new UnauthorizedException("Email or Password is not correct");
        }

        const correctPassword = await bcrypt.compare(loginDto.password, user.password);
        if(!correctPassword) {
            throw new UnauthorizedException("Email or Password is not correct");
        }

        user.isOnline = true;
        await this.userRepo.save(user);
        const { password, ...safeUser } = user;
        return safeUser;
    }

    async sendFriendRequest(senderId: number, receiverName: string): Promise<void> {
        const sender = await this.userRepo.findOne({ where: { id: senderId } });
        if (!sender)
            throw new UnauthorizedException("Sender not found");

        const receiver = await this.userRepo.findOne({ where: { username: receiverName } });
        if (!receiver)
            throw new UnauthorizedException("Receiver not found");

        if (sender.id === receiver.id)
            throw new ConflictException("You cannot send a friend request to yourself");

        if (sender.friends.some(friend => friend.id === receiver.id))
            throw new ConflictException("You are already friends with this user");

        if (receiver.incomingFriendRequests.some(request => request.id === sender.id))
            throw new ConflictException("Friend request already sent");

        if(sender.outgoingFriendRequests.some(request => request.id === receiver.id))
            throw new ConflictException("You have already sent a friend request to this user");

        sender.outgoingFriendRequests.push(receiver);
        receiver.incomingFriendRequests.push(sender);

        await this.userRepo.save(sender);
        await this.userRepo.save(receiver);
    }

    async acceptFriendRequest(senderId: number, receiverId: number): Promise<void> {
        const sender = await this.userRepo.findOne({ where: { id: senderId } });
        if (!sender)
            throw new UnauthorizedException("Sender not found");

        const receiver = await this.userRepo.findOne({ where: { id: receiverId } });
        if (!receiver)
            throw new UnauthorizedException("Receiver not found");

        if (!receiver.incomingFriendRequests.some(request => request.id === sender.id))
            throw new ConflictException("No friend request from this user");

        receiver.incomingFriendRequests = receiver.incomingFriendRequests.filter(request => request.id !== sender.id);
        sender.outgoingFriendRequests = sender.outgoingFriendRequests.filter(request => request.id !== receiver.id);

        sender.friends.push(receiver);
        receiver.friends.push(sender);

        await this.userRepo.save(sender);
        await this.userRepo.save(receiver);
    }

    async rejectFriendRequest(senderId: number, receiverId: number): Promise<void> {
        const sender = await this.userRepo.findOne({ where: { id: senderId } });
        if (!sender)
            throw new UnauthorizedException("Sender not found");

        const receiver = await this.userRepo.findOne({ where: { id: receiverId } });
        if (!receiver)
            throw new UnauthorizedException("Receiver not found");

        if (!receiver.incomingFriendRequests.some(request => request.id === sender.id))
            throw new ConflictException("No friend request from this user");

        receiver.incomingFriendRequests = receiver.incomingFriendRequests.filter(request => request.id !== sender.id);
        sender.outgoingFriendRequests = sender.outgoingFriendRequests.filter(request => request.id !== receiver.id);
        await this.userRepo.save(sender);
        await this.userRepo.save(receiver);
    }

    async deleteFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new UnauthorizedException("User not found");

        const friend = await this.userRepo.findOne({ where: { id: friendId } });
        if (!friend)
            throw new UnauthorizedException("Friend not found");

        if (!user.friends.some(f => f.id === friend.id))
            throw new ConflictException("This user is not your friend");

        user.friends = user.friends.filter(f => f.id !== friend.id);
        friend.friends = friend.friends.filter(f => f.id !== user.id);

        await this.userRepo.save(user);
        await this.userRepo.save(friend);
}

    async setOffline(userId: number): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user)
            await this.userRepo.update(userId, { isOnline: false });
    }
}