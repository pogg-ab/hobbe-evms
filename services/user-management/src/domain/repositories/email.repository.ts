import { Email } from '../entities/email.entity';

export interface IEmailRepository {
  save(email: Email): Promise<void>;
  find(): Promise<Email[]>;
}
