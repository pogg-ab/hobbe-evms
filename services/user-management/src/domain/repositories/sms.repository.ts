import { SMS } from '../entities/sms.entity';
import { SMSID } from '../value-objects/sms-id.value-object';

export interface ISMSRepository {
  create(sms: SMS): Promise<SMS>;
  findAll(): Promise<SMS[]>;
  findOneById(id: SMSID): Promise<SMS | null>;
  update(id: SMSID, sms: SMS): Promise<SMS>;
  delete(id: SMSID): Promise<void>;
  updateStatus(
    id: SMSID,
    status: 'SENT' | 'FAILED' | 'PENDING' | null,
  ): Promise<void>;
}
