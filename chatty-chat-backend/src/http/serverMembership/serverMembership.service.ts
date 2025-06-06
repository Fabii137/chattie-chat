import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { ServerMembership } from "./serverMembership.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ServerMembershipService {
    constructor(@InjectRepository(ServerMembership) private membershipRep: Repository<ServerMembership>) { }
}