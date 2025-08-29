export class ApproveEventCommand {
  constructor(
    public readonly eventId: string,
    public readonly feedback: string | undefined,
    public readonly adminId: string,
  ) {}
}

export class RejectEventCommand {
  constructor(
    public readonly eventId: string,
    public readonly feedback: string,
    public readonly adminId: string,
  ) {}
}

export class RequestEventChangesCommand {
  constructor(
    public readonly eventId: string,
    public readonly feedback: string,
    public readonly adminId: string,
  ) {}
}

export class SetEventPendingCommand {
  constructor(
    public readonly eventId: string,
    public readonly feedback: string | undefined,
    public readonly userId: string,
  ) {}
}

export class CancelEventCommand {
  constructor(
    public readonly eventId: string,
    public readonly feedback: string | undefined,
    public readonly userId: string,
  ) {}
}
