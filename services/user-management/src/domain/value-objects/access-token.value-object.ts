// src/domain/value-objects/access-token.value-object.ts

export class AccessToken {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid Access Token');
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    return value.split('.').length === 3;
  }

  toString(): string {
    return this.value;
  }
}
