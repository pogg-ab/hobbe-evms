import { GoogleUserDto } from "src/presentation/dtos/sso/google-user.dto";

export class GoogleLoginCommand {
  constructor(public readonly user: any) {}
} 