
// src/domain/value-objects/refresh-token.value-object.ts

export class RefreshToken {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid Refresh Token');
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    return value.length === 128;
  }

  toString(): string {
    return this.value;
  }
}
