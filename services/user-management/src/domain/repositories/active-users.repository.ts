export interface IActiveUsersRepository {
  getActiveUsers(
    period: 'daily' | 'weekly' | 'monthly',
    page: number,
    limit: number,
  ): Promise<any>;
}
