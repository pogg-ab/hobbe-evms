import { DownloadEntity } from "src/domain/entities/download.entity";
import { CreateDownloadDto } from "src/presentation/dtos/reports/create-download.dto";
import { GetDownloadsByDateRangeDto } from "src/presentation/dtos/reports/get-downloads-by-daterange.dto";

export interface IAnalyticsRepository {
    collectDownload(dto: CreateDownloadDto): Promise<void>;
    getAnalyticsSummary(): Promise<any>;

    
    getDownloadsByDate(dto:GetDownloadsByDateRangeDto): Promise<DownloadEntity[]>;
    getDownloadsByCountry(country: string): Promise<DownloadEntity[]>;
    getDownloadsByPlatform(platform: string): Promise<DownloadEntity[]>;
    getDownloadsByDeviceType(deviceType: string): Promise<DownloadEntity[]>;
    getDownloadsByOsVersion(osVersion: string): Promise<DownloadEntity[]>;
    getDownloadsByDateRange(startDate: Date, endDate: Date): Promise<DownloadEntity[]>;
    getDownloadsByCountryAndDateRange(country: string, startDate: Date, endDate: Date): Promise<DownloadEntity[]>;
    getDownloadsByPlatformAndDateRange(platform: string, startDate: Date, endDate: Date): Promise<DownloadEntity[]>;
}