import { IQuery } from "@nestjs/cqrs";

export class FindKeyPairQuery implements IQuery {
  constructor(public readonly user_id: string) {}
}