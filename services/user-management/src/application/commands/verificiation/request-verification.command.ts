export class RequestVerificationCommand {
  constructor(public readonly currentUserId: string, public readonly dto: any) {}
}
