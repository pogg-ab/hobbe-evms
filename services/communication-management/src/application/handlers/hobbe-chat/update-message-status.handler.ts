// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { UpdateMessageStatusCommand } from 'src/application/commands/hobbe-chat/update-message-status.command';
// import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';

// @CommandHandler(UpdateMessageStatusCommand)
// export class UpdateMessageStatusHandler implements ICommandHandler<UpdateMessageStatusCommand> {
//   constructor(private readonly messageRepo: MessageRepository) {}

//   async execute(command: UpdateMessageStatusCommand) {
//     return this.messageRepo.updateMessageStatus(command.messageId, command.status);
//   }
// }
