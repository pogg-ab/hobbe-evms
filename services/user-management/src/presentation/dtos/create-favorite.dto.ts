import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'ID of the user who is favoriting another user', example: 'd7f6b8c5-36b4-4ef7-a9ec-f9a9a6c7c4ec' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'ID of the user being favorited', example: 'b5e21a34-3c9d-49b3-a06d-7321caa6c14f' })
  @IsUUID()
  favoriteUserId: string;
}
