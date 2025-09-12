export class ReviewVerificationCommand {
  constructor(
    public readonly adminId: string,
    public readonly verificationRequestId: string,
    public readonly decision: { decision: any; rejectionReason?: string | null },
  ) {}
}
