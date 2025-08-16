
export interface ISignupSourcesRepository {
    getSignupSources(): Promise<any>;
    getSingleSignupSources(user_id:string): Promise<any>;
    // getSignupSourcesByDateRange(startDate: Date, endDate: Date): Promise<any>;
    // getSingleSignupSourcesByDateRange(startDate: Date, endDate: Date): Promise<any>;
}