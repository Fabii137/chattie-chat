import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterDto } from "src/http/dtos/register.dto";
import { LoginDto } from "src/http/dtos/login.dto";
import * as bcrypt from 'bcrypt';
import { SafeUser } from "src/http/dtos/safeUser.dto";
import { ServerEntity } from "../servers/server.entity";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }

    async getUserById(userId: number): Promise<User> {
        const user = await this.userRepo.findOne({where: {id: userId}, 
            relations: [ 
                "friends",
                "incomingFriendRequests",
                "outgoingFriendRequests",
                "privateRooms",
                "servers"
            ]
        });
                
        if(!user) {
            throw new UnauthorizedException("User not found");
        }

        return user;
    }

    async getFriendRequests(userId: number): Promise<User[]> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['incomingFriendRequests']
        });

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        return user.incomingFriendRequests;
    }

    async register(registerDto: RegisterDto): Promise<SafeUser | null> {
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
        return this.toSafeUser(savedUser);
    }


    async login(loginDto: LoginDto): Promise<SafeUser | null> {
        const user = await this.userRepo
            .createQueryBuilder("user")
            .addSelect("user.password") // add password
            .where("user.email = :email", { email: loginDto.email })
            .getOne();

        if (!user) {
            throw new UnauthorizedException("Email or Password is not correct");
        }

        const correctPassword = await bcrypt.compare(loginDto.password, user.password);
        if (!correctPassword) {
            throw new UnauthorizedException("Email or Password is not correct");
        }

        user.isOnline = true;
        await this.userRepo.save(user);

        return this.toSafeUser(user);
    }

    async sendFriendRequest(senderId: number, receiverName: string): Promise<void> {
        const sender = await this.userRepo.findOne({ where: { id: senderId }, relations: ["friends", "outgoingFriendRequests"] });
        if (!sender)
            throw new UnauthorizedException("Sender not found");

        const receiver = await this.userRepo.findOne({ where: { username: receiverName }, relations: ["friends", "incomingFriendRequests"] });
        if (!receiver) {
            throw new UnauthorizedException("Receiver not found");
        }

        if (sender.id === receiver.id) {
            throw new ConflictException("You cannot send a friend request to yourself");
        }

        const alreadyFriends = await this.userRepo.createQueryBuilder('user')
            .leftJoin('user.friends', 'friend')
            .where('user.id = :receiverId', { receiverId: receiver.id})
            .andWhere('friend.id = :senderId', {senderId})
            .getCount();

        if (alreadyFriends) {
            throw new ConflictException("You are already friends with this user");
        }

        const alreadyRequested = await this.userRepo.createQueryBuilder('user')
            .leftJoin('user.incomingFriendRequests', 'request')
            .where('user.id = :receiverId', { receiverId: receiver.id})
            .andWhere('request.id = :senderId', {senderId})
            .getCount();

        if(alreadyRequested) {
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
        const sender = await this.userRepo.findOne({ where: { id: senderId }, relations: ["friends", "outgoingFriendRequests"] });
        if (!sender) {
            throw new UnauthorizedException("Sender not found");
        }

        const receiver = await this.userRepo.findOne({ where: { id: receiverId }, relations: ["friends", "incomingFriendRequests"] });
        if (!receiver) {
            throw new UnauthorizedException("Receiver not found");
        }

        const requestExists = await this.userRepo.createQueryBuilder('user')
            .leftJoin('user.incomingFriendRequests', 'request')
            .where('user.id = :receiverId', { receiverId: receiver.id})
            .andWhere('request.id = :senderId', {senderId})
            .getCount();

        console.log({receiverId: receiver.id, senderId, requestExists})

        if(!requestExists) {
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
        const sender = await this.userRepo.findOne({ where: { id: senderId }, relations: ["outgoingFriendRequests"] });
        if (!sender) {
            throw new UnauthorizedException("Sender not found");
        }

        const receiver = await this.userRepo.findOne({ where: { id: receiverId }, relations: ["incomingFriendRequests"] });
        if (!receiver) {
            throw new UnauthorizedException("Receiver not found");
        }

        const requestExists = await this.userRepo.createQueryBuilder('user')
            .leftJoin('user.incomingFriendRequests', 'request')
            .where('user.id = :receiverId', { receiverId: receiver.id})
            .andWhere('request.id = :senderId', {senderId})
            .getCount();

        if(!requestExists) {
            throw new ConflictException("No friend request from this user");
        }

        receiver.incomingFriendRequests = receiver.incomingFriendRequests?.filter(request => request.id !== sender.id);
        sender.outgoingFriendRequests = sender.outgoingFriendRequests?.filter(request => request.id !== receiver.id);
        await this.userRepo.save(receiver);
        await this.userRepo.save(sender);
    }

    async deleteFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: ["friends"] });
        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        const friend = await this.userRepo.findOne({ where: { id: friendId }, relations: ["friends"] });
        if (!friend) {
            throw new UnauthorizedException("Friend not found");
        }

        if (!user.friends.some(f => f.id === friend.id)) {
            throw new ConflictException("This user is not your friend");
        }

        user.friends = user.friends?.filter(f => f.id !== friend.id);
        friend.friends = friend.friends?.filter(f => f.id !== user.id);

        await this.userRepo.save(user);
        await this.userRepo.save(friend);
    }

    async setOffline(userId: number): Promise<void> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user) {
            await this.userRepo.update(userId, { isOnline: false });
        }
    }

    toSafeUser(user: User): SafeUser {
        const { password, ...safeUser } = user;
        return safeUser;
    }
}