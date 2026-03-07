import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get('MAIL_HOST');
    const port = this.config.get('MAIL_PORT');
    const user = this.config.get('MAIL_USER');
    const pass = this.config.get('MAIL_PASS');
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port ? Number(port) : 587,
        secure: port === '465',
        auth: { user, pass },
      });
    }
  }

  private isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendVerificationEmail(
    to: string,
    username: string,
    token: string,
  ): Promise<boolean> {
    const baseUrl =
      this.config.get('FRONTEND_URL') || this.config.get('API_BASE_URL') || 'https://ggwp.app';
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; background: #0a0e1a; color: #e2e8f0; padding: 24px;">
          <div style="max-width: 480px; margin: 0 auto;">
            <h2 style="color: #00E5FF;">GGWP – E-posta Doğrulama</h2>
            <p>Merhaba <strong>${username}</strong>,</p>
            <p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
            <p><a href="${verifyUrl}" style="color: #00E5FF; word-break: break-all;">${verifyUrl}</a></p>
            <p>Bu link 24 saat geçerlidir. Eğer bu kaydı siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
            <p style="color: #64748b; font-size: 12px;">— GGWP Ekibi</p>
          </div>
        </body>
      </html>
    `;

    if (!this.isConfigured()) {
      console.log('[Mail] SMTP yapılandırılmadı – doğrulama e-postası atlanıyor:', to, 'Token:', token);
      return true;
    }

    try {
      await this.transporter!.sendMail({
        from: this.config.get('MAIL_FROM') || `"GGWP" <${this.config.get('MAIL_USER')}>`,
        to,
        subject: 'GGWP – E-posta adresinizi doğrulayın',
        html,
      });
      return true;
    } catch (err) {
      console.error('[Mail] Doğrulama e-postası gönderilemedi:', err);
      return false;
    }
  }
}
