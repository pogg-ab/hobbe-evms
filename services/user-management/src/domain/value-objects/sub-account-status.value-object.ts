type SubAccountStatusType = 'active' | 'inactive' | 'suspended' | 'pending';

export class SubAccountStatus {
  private readonly status: SubAccountStatusType;

  constructor(status: SubAccountStatusType) {
    if (!SubAccountStatus.isValid(status)) {
      throw new Error('Invalid SubAccount Status');
    }
    this.status = status;
  }

  private static isValid(status: SubAccountStatusType): boolean {
    return ['active', 'inactive', 'suspended', 'pending'].includes(status);
  }

  toString(): string {
    return this.status;
  }

  equals(other: SubAccountStatus): boolean {
    return this.status === other.toString();
  }

  static create(status: SubAccountStatusType): SubAccountStatus {
    return new SubAccountStatus(status);
  }
}