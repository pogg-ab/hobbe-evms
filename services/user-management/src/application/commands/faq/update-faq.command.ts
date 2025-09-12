// src/application/commands/update-faq.command.ts
export class UpdateFaqCommand {
  constructor(public readonly faqId: string, public readonly dto: { title?: string; content?: string; tags?: string[] }) {}
}
