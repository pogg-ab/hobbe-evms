import { AuditLog } from "../../entities/audit-log.entity";

export interface IAuditLogRepository {
  create(log: AuditLog): Promise<AuditLog>;
  findAll(): Promise<AuditLog[]>;
  
}