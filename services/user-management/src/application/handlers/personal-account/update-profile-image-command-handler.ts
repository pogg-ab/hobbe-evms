import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PersonalAccountService } from 'src/application/services/personal-account.service';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { UpdateProfileImageCommand } from '../../commands/personal-account/update-profile-image-command';

@CommandHandler(UpdateProfileImageCommand)
export class UpdateProfileImageCommandHandler
    implements ICommandHandler<UpdateProfileImageCommand> {
    constructor(
        private readonly personalAccountService: PersonalAccountService,
    ) { }

    async execute(
        command: UpdateProfileImageCommand,
    ): Promise<PersonalAccount> {
        const { id, profile_image } = command;
        return this.personalAccountService.updateProfileImage(id, profile_image);
    }
}
