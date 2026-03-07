"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    config;
    transporter = null;
    constructor(config) {
        this.config = config;
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
    isConfigured() {
        return this.transporter !== null;
    }
    async sendVerificationEmail(to, username, token) {
        const apiBase = (this.config.get('API_BASE_URL') || 'https://ggwp-api.onrender.com').replace(/\/$/, '');
        const verifyUrl = `${apiBase}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
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
            await this.transporter.sendMail({
                from: this.config.get('MAIL_FROM') || `"GGWP" <${this.config.get('MAIL_USER')}>`,
                to,
                subject: 'GGWP – E-posta adresinizi doğrulayın',
                html,
            });
            return true;
        }
        catch (err) {
            console.error('[Mail] Doğrulama e-postası gönderilemedi:', err);
            return false;
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map