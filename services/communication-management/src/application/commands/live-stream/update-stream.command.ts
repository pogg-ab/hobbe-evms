export class UpdateStreamCommand {
  constructor(
    public readonly streamId: string,
    public readonly url: string,
    public readonly status: 'inactive' | 'active' | 'completed',
  ) {}
}
