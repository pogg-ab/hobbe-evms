// src/application/commands/create-faq.command.ts
export class CreateFaqCommand {
  constructor(public readonly creatorId: string, public readonly dto: { title: string; content?: string; tags?: string[] }) {}
}
