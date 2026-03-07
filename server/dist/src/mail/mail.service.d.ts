import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private transporter;
    constructor(config: ConfigService);
    private isConfigured;
    sendVerificationEmail(to: string, username: string, token: string): Promise<boolean>;
}
