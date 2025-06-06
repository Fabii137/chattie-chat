import { Controller } from "@nestjs/common";
import { ServerService } from "./server.service";

@Controller('servers')
export class ServerController {
    constructor(private serverService: ServerService) { }
}