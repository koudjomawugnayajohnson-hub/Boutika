export interface MailerService {
  sendAdminOtp(email: string, otp: string): Promise<void>;
}
