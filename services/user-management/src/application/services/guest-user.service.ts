import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestSession } from '../../domain/entities/guest-session.entity';
import { Auth } from '../../domain/entities/auth.entity';
import { User } from '../../domain/entities/user.entity';
import { SessionID } from '../../domain/value-objects/session-id.value-object';
import { UserID } from '../../domain/value-objects/user-id.value-object';
import { AuthID } from '../../domain/value-objects/auth-id.value-object';
import { GuestInsightsDto } from 'src/presentation/dtos/Guest User Insight/guest-insights.dto';
import { CreateGuestSessionResponseDto } from 'src/presentation/dtos/Guest User Insight/create-guest-session-response.dto';
import { UpgradeGuestResponseDto } from 'src/presentation/dtos/Guest User Insight/upgrade-guest-response.dto';
import { GuestSessionDto } from 'src/presentation/dtos/Guest User Insight/guest-session.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class GuestUserService {
    private readonly logger = new Logger(GuestUserService.name);

    constructor(
        @InjectRepository(GuestSession)
        private readonly guestSessionRepository: Repository<GuestSession>,
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async createGuestSession(
        deviceInfo: string,
        ipAddress: string,
    ): Promise<CreateGuestSessionResponseDto> {
        try {
            const sessionId = new SessionID();
            const authToken = this.generateToken();
            const refreshToken = this.generateToken();
            const sessionToken = this.generateToken();

            const session = this.guestSessionRepository.create({
                session_id: sessionId.toString(),
                session_token: sessionToken,
                device_info: deviceInfo,
                ip_address: ipAddress,
                last_activity: new Date(),
            });

            await this.guestSessionRepository.save(session);

            const auth = this.authRepository.create({
                session_id: sessionId.toString(),
                refresh_token: refreshToken,
                access_token: authToken,
                token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                last_login: new Date(),
                is_guest: true,
            });

            await this.authRepository.save(auth);

            return {
                sessionId: sessionId.toString(),
                authToken,
                refreshToken,
                expiresAt: auth.token_expires_at,
                sessionToken
            };
        } catch (error) {
            this.logger.error('Failed to create guest session', error.stack);
            throw error;
        }
    }

    async upgradeGuestToUser(
        sessionId: SessionID,
        userId: UserID,
    ): Promise<UpgradeGuestResponseDto> {
        try {
            const session = await this.guestSessionRepository.findOne({
                where: { session_id: sessionId.toString() },
            });

            if (!session) {
                throw new Error('Guest session not found');
            }

            const user = await this.userRepository.findOne({
                where: { user_id: userId.toString() },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const auth = await this.authRepository.findOne({
                where: { session_id: sessionId.toString() },
            });

            if (!auth) {
                throw new Error('Auth record not found for guest session');
            }

            auth.user_id = userId;
            auth.session_id = undefined;
            auth.is_guest = false;
            auth.upgraded_at = new Date();
            await this.authRepository.save(auth);


            await this.guestSessionRepository.delete(sessionId.toString());

            return {
                success: true,
                userId: userId.toString(),
                sessionId: sessionId.toString(),
                upgradedAt: new Date(),
            };
        } catch (error) {
            this.logger.error(
                `Failed to upgrade guest session ${sessionId.toString()} to user ${userId.toString()}`,
                error.stack,
            );
            throw error;
        }
    }

    async getGuestSession(sessionId: SessionID): Promise<GuestSessionDto> {
        try {
            const session = await this.guestSessionRepository.findOne({
                where: { session_id: sessionId.toString() },
            });

            if (!session) {
                throw new Error('Guest session not found');
            }

            return {
                sessionId: session.session_id,
                deviceInfo: session.device_info,
                ipAddress: session.ip_address,
                createdAt: session.created_at,
                lastActivity: session.last_activity,
                isActive: this.isSessionActive(session.last_activity),
            };
        } catch (error) {
            this.logger.error(
                `Failed to get guest session ${sessionId.toString()}`,
                error.stack,
            );
            throw error;
        }
    }

    async getGuestInsights(
        days: number = 7,
        limit: number = 100,
    ): Promise<GuestInsightsDto> {
        try {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - days);

            const [sessions, totalSessions] = await this.guestSessionRepository
                .createQueryBuilder('session')
                .where('session.created_at >= :dateThreshold', { dateThreshold })
                .orderBy('session.created_at', 'DESC')
                .take(limit)
                .getManyAndCount();

            const convertedSessions = await this.authRepository
                .createQueryBuilder('auth')
                .where('auth.is_guest = false')
                .andWhere('auth.upgraded_at IS NOT NULL')
                .andWhere('auth.created_at >= :dateThreshold', { dateThreshold })
                .getCount();

            const activeSessions = sessions.filter((session) =>
                this.isSessionActive(session.last_activity),
            ).length;

            const deviceStats = this.analyzeDeviceTypes(sessions);

            return {
                totalSessions,
                activeSessions,
                convertedSessions,
                conversionRate: totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0,
                averageSessionDuration: this.calculateAverageDuration(sessions),
                deviceStats,
                recentSessions: sessions.slice(0, 10).map((session) => ({
                    sessionId: session.session_id,
                    createdAt: session.created_at,
                    lastActivity: session.last_activity,
                    deviceInfo: session.device_info,
                    ipAddress: session.ip_address,
                })),
            };
        } catch (error) {
            this.logger.error('Failed to get guest insights', error.stack);
            throw error;
        }
    }

    @Cron('0 0 * * *')
    async cleanupExpiredSessions(): Promise<void> {
        try {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() - 30); // 30 days retention

            const result = await this.guestSessionRepository
                .createQueryBuilder()
                .delete()
                .where('last_activity < :date', { date: expirationDate })
                .execute();

            this.logger.log(
                `Cleaned up ${result.affected} expired guest sessions`,
            );
        } catch (error) {
            this.logger.error('Failed to cleanup expired guest sessions', error.stack);
        }
    }

    private generateToken(): string {
        return require('crypto').randomBytes(64).toString('hex');
    }

    private isSessionActive(lastActivity: Date): boolean {
        const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
        return new Date().getTime() - lastActivity.getTime() < inactiveThreshold;
    }

    private calculateAverageDuration(sessions: GuestSession[]): number {
        if (sessions.length === 0) return 0;

        const validSessions = sessions.filter(session => {
            const duration = session.last_activity.getTime() - session.created_at.getTime();
            return duration >= 0;
        });

        const averageSessionDuration = validSessions.length > 0
            ? validSessions.reduce((sum, session) => {
                return sum + (session.last_activity.getTime() - session.created_at.getTime());
            }, 0) / validSessions.length
            : 0;

        return averageSessionDuration;
    }

    private analyzeDeviceTypes(sessions: GuestSession[]): {
        mobile: number;
        desktop: number;
        tablet: number;
        other: number;
    } {
        const stats = {
            mobile: 0,
            desktop: 0,
            tablet: 0,
            other: 0,
        };

        sessions.forEach((session) => {
            const ua = session.device_info.toLowerCase();
            if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
                stats.mobile++;
            } else if (ua.includes('tablet') || ua.includes('ipad')) {
                stats.tablet++;
            } else if (
                ua.includes('windows') ||
                ua.includes('macintosh') ||
                ua.includes('linux')
            ) {
                stats.desktop++;
            } else {
                stats.other++;
            }
        });

        return stats;
    }
}