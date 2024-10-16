// src/domain/events/user-created.event.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phoneNumber: string,
    public readonly address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    },
  ) {}
}
