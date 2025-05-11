
export enum TicketHeadingStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    CANCELLED = 'cancelled',
    CLOSED = 'closed',
  }
  
  export class TicketHeadingStatusVO {
    private readonly value: TicketHeadingStatus;
  
    constructor(status: string) {
      if (!Object.values(TicketHeadingStatus).includes(status as TicketHeadingStatus)) {
        throw new Error(`Invalid status: ${status}. Allowed values are: ${Object.values(TicketHeadingStatus).join(', ')}`);
      }
      this.value = status as TicketHeadingStatus;
    }
  
    getValue(): TicketHeadingStatus {
      return this.value;
    }
  
    isActive(): boolean {
      return this.value === TicketHeadingStatus.ACTIVE;
    }
  
    isPending(): boolean {
      return this.value === TicketHeadingStatus.PENDING;
    }
  
    isClosed(): boolean {
      return this.value === TicketHeadingStatus.CLOSED;
    }
  
    toString(): string {
      return this.value;
    }
  }
  