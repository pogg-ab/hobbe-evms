import { ICommand } from "@nestjs/cqrs";
import { E2EEDto } from "src/presentation/dto/e2ee/create.e2ee.dto";


export class CreateE2EECommand implements ICommand{
    constructor(
        public readonly e2eeDto: E2EEDto,
    ){}
}