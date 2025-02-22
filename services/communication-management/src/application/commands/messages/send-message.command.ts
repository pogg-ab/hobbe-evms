export class SendMessageCommand {
    constructor(
      public readonly senderId: number,
      public readonly receiverId: number,
      public readonly content: string,
    ) {}
  }
  