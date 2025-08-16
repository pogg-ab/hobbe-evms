import { OAuthLoginDto } from "src/presentation/dtos/sso/oauth.dto";

export class LoginWithOAuthCommand {
  constructor(public readonly dto: OAuthLoginDto) {}
}
