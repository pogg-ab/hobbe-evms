import { ICommand } from "@nestjs/cqrs";
import { AddChatMemberDto } from "src/presentation/dto/hobbe-chat/add-chat-member.dto";

export class AddChatMemberCommand implements ICommand {
    constructor(public readonly addChatMemberDto: AddChatMemberDto) {}
  }
  