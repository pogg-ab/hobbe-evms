import { Injectable, NotFoundException } from '@nestjs/common';
import { Ticket } from 'src/domain/entities/support/ticket.entity';
import { ITicketRepository } from 'src/domain/repositories/support/ticket.repository';
import { FreshdeskConfigService } from 'src/infrastructure/support/freshdesk.config';
import axios from 'axios';
import * as FormData from 'form-data';
export interface FileStream {
    filename: string;
    buffer: Uint8Array;
    contentType: string;
    size: number;
}

@Injectable()
export class TicketRepositoryImpl implements ITicketRepository {
    constructor(private readonly configService: FreshdeskConfigService) { }

    async create(ticket: Partial<Ticket> & { attachments?: FileStream[] }): Promise<Ticket> {
        const formData = new FormData();

        formData.append('subject', ticket.subject);
        formData.append('description', ticket.description);
        formData.append('email', ticket.email);
        formData.append('priority', ticket.priority?.toString() || '1');
        formData.append('status', ticket.status?.toString() || '2');

        if (ticket.attachments && ticket.attachments.length > 0) {
            for (const attachment of ticket.attachments) {
                formData.append('attachments[]', Buffer.from(attachment.buffer), {
                    filename: attachment.filename,
                    contentType: attachment.contentType,
                    knownLength: attachment.size,
                });
            }
        }
        try {
            const response = await axios.post(
                `${this.configService.baseUrl}/tickets`,
                formData,
                {
                    headers: {
                        ...this.configService.authHeader,
                        ...formData.getHeaders(),
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                }
            );

            return response.data as Ticket;
        } catch (error) {
            console.error('Freshdesk API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async findAll(skip?: number, take?: number): Promise<Ticket[]> {
        const params: any = {};

        if (skip !== undefined) {
            params.page = Math.floor(skip / (take || 30)) + 1; // Calculate page number
        }

        if (take !== undefined) {
            params.per_page = take;
        }

        const response = await axios.get(
            `${this.configService.baseUrl}/tickets`,
            {
                headers: this.configService.authHeader,
                params
            }
        );

        return response.data as Ticket[];
    }

    async findOneById(id: number): Promise<Ticket | null> {
        try {
            const response = await axios.get(
                `${this.configService.baseUrl}/tickets/${id}`,
                { headers: this.configService.authHeader }
            );
            return response.data as Ticket;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async update(id: number, ticket: Partial<Ticket>): Promise<Ticket> {
        try {
            const response = await axios.put(
                `${this.configService.baseUrl}/tickets/${id}`,
                ticket,
                { headers: this.configService.authHeader }
            );
            return response.data as Ticket;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Ticket with ID ${id} not found`);
            }
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await axios.delete(
                `${this.configService.baseUrl}/tickets/${id}`,
                { headers: this.configService.authHeader }
            );
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Ticket with ID ${id} not found`);
            }
            throw error;
        }
    }

    async search(query: string): Promise<Ticket[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/tickets?query="${encodeURIComponent(query)}"`,
            { headers: this.configService.authHeader }
        );
        return response.data as Ticket[];
    }

    async findByStatus(status: number): Promise<Ticket[]> {

        const query = `status:${status}`;
        const response = await axios.get(
            `${this.configService.baseUrl}/search/tickets`,
            {
                headers: this.configService.authHeader,
                params: { query: `"${query}"` }
            }
        );
        return response.data as Ticket[];
    }

    async findByPriority(priority: number): Promise<Ticket[]> {
        const response = await axios.get(
            `${this.configService.baseUrl}/tickets?priority=${priority}`,
            { headers: this.configService.authHeader }
        );
        return response.data as Ticket[];
    }
}