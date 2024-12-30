export class LikeEventCommand {
    constructor(
      public readonly user_id: string,
      public readonly event_id: string,
    ) {}
  }
  