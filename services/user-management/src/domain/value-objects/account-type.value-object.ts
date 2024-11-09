// src/domain/value-objects/account-type.value-object.ts

export enum AccountType {
  PERSONAL = 'personal',
  ORGANIZATIONAL = 'organizational',
}

export class AccountTypeValueObject {
  private readonly type: AccountType;

  constructor(type: AccountType) {
    this.type = type;
  }

  getType(): AccountType {
    return this.type;
  }

  toString(): string {
    return this.type;
  }
}
