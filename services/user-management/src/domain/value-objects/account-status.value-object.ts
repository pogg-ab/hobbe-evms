export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}
export class AccountStatus {
  private readonly status: Status;

  constructor(status: Status) {
    if (!this.isValid(status)) {
      throw new Error('Invalid Account Status');
    }
    this.status = status;
  }

  private isValid(status: string): boolean {
    return Object.values(Status).includes(status as Status);
  }

  toString(): string {
    return this.status;
  }

  valueOf(): string {
    return this.status;
  }

  get value(): Status {
    return this.status;
  }

  static active(): AccountStatus {
    return new AccountStatus(Status.ACTIVE);
  }

  static inactive(): AccountStatus {
    return new AccountStatus(Status.INACTIVE);
  }

  static suspended(): AccountStatus {
    return new AccountStatus(Status.SUSPENDED);
  }

  static pending(): AccountStatus {
    return new AccountStatus(Status.PENDING);
  }
}
