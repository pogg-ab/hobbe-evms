import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DownloadEntity } from "src/domain/entities/download.entity";
import { IAnalyticsRepository } from "src/domain/repositories/reports/analytics.repository";
import { CreateDownloadDto } from "src/presentation/dtos/reports/create-download.dto";
import { GetDownloadsByDateRangeDto } from "src/presentation/dtos/reports/get-downloads-by-daterange.dto";
import { Between, Repository } from "typeorm";


@Injectable()
export class AnalyticsRepositoryImpl implements IAnalyticsRepository {
    constructor(
        @InjectRepository(DownloadEntity)
        private readonly downloadRepo: Repository<DownloadEntity>,
    ) {}

    async collectDownload(dto: CreateDownloadDto): Promise<void> {
        const download = this.downloadRepo.create(dto);
        await this.downloadRepo.save(download);
    }


    async getDownloadsByDate(dto: GetDownloadsByDateRangeDto): Promise<any> {
        const { startDate, endDate } = dto;
        // aggregate the the data by platform, device type, os version, and country

        const query = this.downloadRepo.createQueryBuilder('download')
            .where('download.collectedAt BETWEEN :startDate AND :endDate', { startDate, endDate });
        query.select([
            'download.platform',
            'download.deviceType',
            'download.osVersion',
            'download.country',
            'COUNT(download.id) AS downloadCount'
        ])
            .groupBy('download.platform')
            .addGroupBy('download.deviceType')
            .addGroupBy('download.osVersion')
            .addGroupBy('download.country');
        return await query.getRawMany();


    }


    async getDownloadsByCountry(country: string): Promise<any> {
        // aggregate the data by platform, device type, os version where country matches
        const query = this.downloadRepo.createQueryBuilder('download')
            .where('download.country = :country', { country });
        query.select([
            'download.platform',
            'download.deviceType',
            'download.osVersion',
            'COUNT(download.id) AS downloadCount'
        ])
            .groupBy('download.platform')
            .addGroupBy('download.deviceType')
            .addGroupBy('download.osVersion');
        return await query.getRawMany();
    }

    async getDownloadsByPlatform(platform: 'android' | 'ios' | 'web' | 'desktop'): Promise<DownloadEntity[]> {
        // aggregate the data by device type, os version, and country where platform matches
        const query = this.downloadRepo.createQueryBuilder('download')
            .where('download.platform = :platform', { platform });
        query.select([
            'download.deviceType',
            'download.osVersion',
            'download.country',
            'COUNT(download.id) AS downloadCount'
        ])
            .groupBy('download.deviceType')
            .addGroupBy('download.osVersion')
            .addGroupBy('download.country');

        return await query.getRawMany();
    }

    async getDownloadsByDeviceType(deviceType: string): Promise<DownloadEntity[]> {
        return await this.downloadRepo.find({ where: { deviceType } });
    }

    async getDownloadsByOsVersion(osVersion: string): Promise<DownloadEntity[]> {
        return await this.downloadRepo.find({ where: { osVersion } });
    }

    async getDownloadsByDateRange(startDate: Date, endDate: Date): Promise<DownloadEntity[]> {
        return await this.downloadRepo.find({ where: { collectedAt: Between(startDate, endDate) } });
    }

    async getDownloadsByCountryAndDateRange(country: string, startDate: Date, endDate: Date): Promise<DownloadEntity[]> {
        return await this.downloadRepo.find({ where: { country, collectedAt: Between(startDate, endDate) } });
    }

    async getDownloadsByPlatformAndDateRange(platform: 'android' | 'ios' | 'web' | 'desktop', startDate: Date, endDate: Date): Promise<DownloadEntity[]> {
        return await this.downloadRepo.find({ where: { platform, collectedAt: Between(startDate, endDate) } });
    }
    

    async getAnalyticsSummary(): Promise<any> {
        const total = await this.downloadRepo.count();

        const byPlatform = await this.downloadRepo
            .createQueryBuilder('d')
            .select('d.platform', 'platform')
            .addSelect('COUNT(*)', 'count')
            .groupBy('d.platform')
            .getRawMany();

        const byDeviceType = await this.downloadRepo
            .createQueryBuilder('d')
            .select('d.deviceType', 'deviceType')
            .addSelect('COUNT(*)', 'count')
            .groupBy('d.deviceType')
            .getRawMany();

        const byOSVersion = await this.downloadRepo
            .createQueryBuilder('d')
            .select('d.osVersion', 'osVersion')
            .addSelect('COUNT(*)', 'count')
            .groupBy('d.osVersion')
            .getRawMany();

        const byCountry = await this.downloadRepo
            .createQueryBuilder('d')
            .select('d.country', 'country')
            .addSelect('COUNT(*)', 'count')
            .groupBy('d.country')
            .getRawMany();

        return {
            totalDownloads: total,
            byPlatform,
            byDeviceType,
            byOSVersion,
            byCountry,
        };
    }
}