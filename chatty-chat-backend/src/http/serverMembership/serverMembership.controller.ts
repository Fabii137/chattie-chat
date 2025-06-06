import { Controller } from "@nestjs/common";
import { ServerMembershipService } from "./serverMembership.service";

@Controller('memberships')
export class ServerMembershipController {
    constructor(private membershipService: ServerMembershipService) { }
}