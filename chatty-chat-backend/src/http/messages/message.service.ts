import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Message } from "./message.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class MessageService {
    constructor(@InjectRepository(Message) private messageRepo: Repository<Message>) { }
}