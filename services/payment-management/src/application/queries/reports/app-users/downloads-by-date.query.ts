import { GetDownloadsByDateRangeDto } from "src/presentation/dtos/reports/get-downloads-by-daterange.dto";


export class AppDownloadsByDateQuery {
  constructor(public readonly dto:GetDownloadsByDateRangeDto) {}
}