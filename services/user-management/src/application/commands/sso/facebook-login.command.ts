import { FacebookUserDto } from "src/presentation/dtos/sso/facebook-user.dto";

export class FacebookLoginCommand {
  constructor(public readonly user: any) {}
} 