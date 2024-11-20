export interface UserValidationResponse {
  success: boolean;
  message?: string;
  user?: any;
  roles?: string[];
}
