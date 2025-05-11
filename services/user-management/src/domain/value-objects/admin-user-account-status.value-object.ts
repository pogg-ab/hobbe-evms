// src/domain/value-objects/admin-user-account-status.value-object.ts

export type AdminUserAccountStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending';

export class AdminUserAccountStatusValueObject {
  private readonly status: AdminUserAccountStatus;

  constructor(status: AdminUserAccountStatus) {
    if (!this.isValid(status)) {
      throw new Error('Invalid AdminUserAccount Status');
    }
    this.status = status;
  }

  private isValid(status: AdminUserAccountStatus): boolean {
    return ['active', 'inactive', 'suspended', 'pending'].includes(status);
  }

  toString(): string {
    return this.status;
  }
}
