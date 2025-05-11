import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DownloadEntity } from "src/domain/entities/download.entity";
import { IAnalyticsRepository } from "src/domain/repositories/reports/analytics.repository";
import { CreateDownloadDto } from "src/presentation/dtos/reports/create-download.dto";
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

    async getDownloadsByDate(collectedAt: Date): Promise<DownloadEntity[]> {
        return await this.downloadRepo.find({ where: {  collectedAt } });
    }


    async getDownloadsByCountry(country: string): Promise<DownloadEntity[]> {
        return await this.downloadRepo.find({ where: { country } });
    }

    async getDownloadsByPlatform(platform: 'android' | 'ios' | 'web' | 'desktop'): Promise<DownloadEntity[]> {
        return await this.downloadRepo.find({ where: { platform } });
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