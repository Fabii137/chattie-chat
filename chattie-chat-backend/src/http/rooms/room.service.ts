import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Room } from "./room.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class RoomService {
    constructor(@InjectRepository(Room) private roomRepo: Repository<Room>) { }
}