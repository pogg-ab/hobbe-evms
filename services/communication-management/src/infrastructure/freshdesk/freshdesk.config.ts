import { Injectable } from '@nestjs/common';

@Injectable()
export class FreshdeskConfigService {
    private readonly domain = process.env.FRESHDESK_DOMAIN;
    private readonly apiKey = process.env.FRESHDESK_API_KEY;

    get baseUrl(): string {
        return `https://${this.domain}/api/v2`;
    }

    get authHeader(): { Authorization: string } {
        const token = Buffer.from(`${this.apiKey}:X`).toString('base64');
        return { Authorization: `Basic ${token}` };
    }
}
