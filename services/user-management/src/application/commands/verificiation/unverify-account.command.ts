export class UnverifyAccountCommand {
  constructor(public readonly adminId: string, public readonly personalAccountId: string) {}
}
