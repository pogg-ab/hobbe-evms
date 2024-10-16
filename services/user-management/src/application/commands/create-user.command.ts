import { Address } from 'src/domain/value-objects/address.value-object';

export class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly phoneNumber: string,
    public readonly address: Address,
  ) {}
}
