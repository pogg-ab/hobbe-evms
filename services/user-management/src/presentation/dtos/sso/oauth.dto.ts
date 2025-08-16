export class OAuthLoginDto {
  provider: Provider;
  providerId: string;
  email: string;
  name: string;
  accessToken?: string;
  refreshToken?: string;
}


export enum Provider {
  Google = 'Google',
  Facebook = 'Facebook',
  LinkedIn = 'LinkedIn',
  Apple = 'Apple',
  GitHub = 'GitHub',
}
