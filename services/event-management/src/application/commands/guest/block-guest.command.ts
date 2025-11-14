export class BlockGuestCommand {
  constructor(
    public readonly ticketId: string,
    public readonly organizerId: string,
    public readonly eventId: string,
    public readonly reason?: string,
  ) {}
}
