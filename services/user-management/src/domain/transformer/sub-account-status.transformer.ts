import { ValueTransformer } from 'typeorm';
import { SubAccountStatus } from '../value-objects/sub-account-status.value-object';
export class SubAccountStatusTransformer implements ValueTransformer {
    to(status: SubAccountStatus): string {
        return status.toString();
    }

    from(value: string): SubAccountStatus {
        return new SubAccountStatus(value as any);
    }
}