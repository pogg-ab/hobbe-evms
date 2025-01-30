import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateE2EECommand } from "src/application/commands/e2ee/create-e2ee.command";
import { E2eeService } from "src/application/services/e2ee/e2ee.service";
import { E2EE } from "src/domain/entities/e2ee.entity";

@CommandHandler(CreateE2EECommand)

export class CreateE2EECommandHandler implements ICommandHandler<CreateE2EECommand>{
    constructor(private readonly e2eeService:E2eeService){}
    execute(command: CreateE2EECommand): Promise<E2EE> {
        const {e2eeDto} = command;
        return this.e2eeService.storeKeyPair(e2eeDto);
    }
}