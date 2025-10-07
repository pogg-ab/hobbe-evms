import { IsIn } from 'class-validator';

export class FindEventByUserAndStatusDto {
  @IsIn(['past', 'future', 'drafted'])
  status: 'past' | 'future' | 'drafted';
}
