
import { ApiProperty } from '@nestjs/swagger';

export class SearchFilters {
    @ApiProperty({ required: false })
    name?: string;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ required: false })
    accountType?: string;
}
