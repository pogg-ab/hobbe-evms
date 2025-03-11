import { IQuery } from "@nestjs/cqrs";
import { ChatUser } from "src/domain/entities/hobbe-chat/chat-user.entity";

export class FindKeyPairQuery implements IQuery {
  constructor(public readonly user: string) {}
}