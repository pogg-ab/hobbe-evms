export class CreateStreamCommand {
  constructor(
    public readonly userId: string,
    public readonly eventId: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) { }
}