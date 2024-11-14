type Status = 'active' | 'inactive' | 'suspended' | 'pending';

export class AccountStatus {
  private readonly status: Status;

  constructor(status: Status) {
    if (!this.isValid(status)) {
      throw new Error('Invalid Account Status');
    }
    this.status = status;
  }

  private isValid(status: Status): boolean {
    return ['active', 'inactive', 'suspended', 'pending'].includes(status);
  }

  toString(): string {
    return this.status;
  }
}
