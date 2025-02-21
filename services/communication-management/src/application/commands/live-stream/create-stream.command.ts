export class CreateStreamCommand {
  constructor(
    public readonly url: string,
    public readonly userId: string,
    public readonly eventId: string,
  ) {}
}
