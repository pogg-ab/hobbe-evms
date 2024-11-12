// src/domain/value-objects/personal-account-id.value-object.ts

import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class IdValueObject  {
  private readonly value: string;

  constructor(value?: string) {
    if (value) {
      if (!this.isValid(value)) {
        throw new Error('Invalid ID format. Expected a UUID string. Received: ' + value);
      }
      this.value = value;
    } else {
      this.value = uuidv4();
    }
  }

  private isValid(value: string): boolean {
    return uuidValidate(value);
  }

  toString(): string {
    return this.value;
  }
}
