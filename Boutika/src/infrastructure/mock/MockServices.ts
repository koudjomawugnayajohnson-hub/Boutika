import { MailerService } from '../../core/services';

export class MockMailerService implements MailerService {
  async sendAdminOtp(email: string, otp: string): Promise<void> {
    console.log(`\n=========================================`);
    console.log(`[MOCK MAILER SERVICE] OTP GENERATED`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`=========================================\n`);
    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}
