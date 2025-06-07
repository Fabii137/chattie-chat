import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServerEntity } from "./server.entity";
import { ServerMembership } from "src/http/serverMembership/serverMembership.entity";

@Injectable()
export class ServerService {
    constructor(@InjectRepository(ServerEntity) private serverRepo: Repository<ServerEntity>,
        @InjectRepository(ServerMembership) private membershipRepo: Repository<ServerMembership>) { }
}