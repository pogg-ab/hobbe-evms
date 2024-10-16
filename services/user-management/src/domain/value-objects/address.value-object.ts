// src/domain/value-objects/address.value-object.ts
import { IsNotEmpty, IsString, Matches, validateSync } from 'class-validator';

export class Address {
  @IsString()
  @IsNotEmpty()
  private readonly street: string;

  @IsString()
  @IsNotEmpty()
  private readonly city: string;

  @IsString()
  @IsNotEmpty()
  private readonly state: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5}(?:-[0-9]{4})?$/, {
    message: 'Invalid postal code format.',
  })
  private readonly postalCode: string;

  constructor(street: string, city: string, state: string, postalCode: string) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.postalCode = postalCode;
    this.validate();
  }

  private validate() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(
        `Validation failed: ${errors.map((err) => err.toString()).join(', ')}`,
      );
    }
  }

  toString(): string {
    return `${this.street}, ${this.city}, ${this.state}, ${this.postalCode}`;
  }

  getStreet(): string {
    return this.street;
  }

  getCity(): string {
    return this.city;
  }

  getState(): string {
    return this.state;
  }

  getPostalCode(): string {
    return this.postalCode;
  }
}
