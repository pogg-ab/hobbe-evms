import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DownloadEntity } from 'src/domain/entities/download.entity';
import { IAnalyticsRepository } from 'src/domain/repositories/reports/analytics.repository';
import { CreateDownloadDto } from 'src/presentation/dtos/reports/create-download.dto';
import { Repository } from 'typeorm';


@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('ANALYTICS_TOKEN')
    private readonly analyticsRepository: IAnalyticsRepository, 
  ) {}

  async collectDownload(dto: CreateDownloadDto) {
     return await this.analyticsRepository.collectDownload(dto);
  }


  async getAnalyticsSummary() {
    return await this.analyticsRepository.getAnalyticsSummary();
  }

  async getDownloadsByCountry(country: string): Promise<DownloadEntity[]> {
    return await this.analyticsRepository.getDownloadsByCountry(country);
  }

  async getDownloadsByPlatform(platform: 'android' | 'ios' | 'web' | 'desktop'): Promise<DownloadEntity[]> {
    return await this.analyticsRepository.getDownloadsByPlatform(platform);
  }

  
  async getDownloadsByDate(date: Date): Promise<DownloadEntity[]> {
    return await this.analyticsRepository.getDownloadsByDate(date);
  }
}
