/**
 * IAP: Apple makbuz doğrulama (verifyReceipt) ile Premium abonelik ve Pentakill paketleri.
 * Sunucu .env içinde APPLE_IAP_SHARED_SECRET (App Store Connect → App → App Information → App-Specific Shared Secret) tanımlı olmalı.
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileService } from '../profile/profile.service';

const APPLE_VERIFY_PRODUCTION = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_VERIFY_SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt';

const PREMIUM_PRODUCT_IDS: Record<string, string> = {
  'com.ggwp.app.premium.weekly': 'weekly',
  'com.ggwp.app.premium.monthly': 'monthly',
};

const PENTAKILL_PRODUCT_IDS: Record<string, string> = {
  'com.ggwp.app.pentakill.single': 'single',
  'com.ggwp.app.pentakill.pack': 'pack',
  'com.ggwp.app.pentakill.series': 'series',
};

@Injectable()
export class IapService {
  constructor(
    private config: ConfigService,
    private profileService: ProfileService,
  ) {}

  async verifyAndGrant(
    userId: string,
    platform: string,
    productId: string,
    receiptData: string,
  ) {
    if (platform !== 'ios') {
      throw new BadRequestException('Sadece iOS destekleniyor.');
    }

    const sharedSecret = this.config.get('APPLE_IAP_SHARED_SECRET');
    if (!sharedSecret) {
      throw new BadRequestException('Sunucu IAP yapılandırması eksik.');
    }

    let result = await this.verifyReceipt(receiptData, sharedSecret, false);
    if (result.status === 21007) {
      result = await this.verifyReceipt(receiptData, sharedSecret, true);
    }
    if (result.status !== 0) {
      throw new BadRequestException('Makbuz doğrulanamadı.');
    }

    const latestReceiptInfo = result.latest_receipt_info ?? [];
    const inAppReceipts = result.receipt?.in_app ?? [];
    const allTransactions = [...latestReceiptInfo, ...inAppReceipts];

    if (productId === 'restore') {
      const activeSub = allTransactions.find((t: any) => {
        const pid = t.product_id;
        if (!PREMIUM_PRODUCT_IDS[pid]) return false;
        const expiresMs = Number(t.expires_date_ms);
        return expiresMs > Date.now();
      });
      if (!activeSub) {
        throw new BadRequestException('Aktif abonelik bulunamadı.');
      }
      const plan = PREMIUM_PRODUCT_IDS[activeSub.product_id];
      return this.profileService.activatePremium(userId, plan);
    }

    const planId = PREMIUM_PRODUCT_IDS[productId];
    const packageId = PENTAKILL_PRODUCT_IDS[productId];

    if (!planId && !packageId) {
      throw new BadRequestException('Geçersiz ürün.');
    }

    const hasThisProduct = allTransactions.some(
      (t: any) => t.product_id === productId,
    );

    if (planId) {
      if (hasThisProduct) {
        return this.profileService.activatePremium(userId, planId);
      }
      const anyActiveSub = allTransactions.find((t: any) => {
        return PREMIUM_PRODUCT_IDS[t.product_id] && Number(t.expires_date_ms) > Date.now();
      });
      if (anyActiveSub) {
        return this.profileService.activatePremium(userId, PREMIUM_PRODUCT_IDS[anyActiveSub.product_id]);
      }
      throw new BadRequestException('Bu ürün bu makbuzda bulunamadı.');
    }

    if (!hasThisProduct) {
      throw new BadRequestException('Bu ürün bu makbuzda bulunamadı.');
    }
    return this.profileService.purchasePentakill(userId, packageId!);
  }

  private async verifyReceipt(
    receiptData: string,
    password: string,
    sandbox: boolean,
  ): Promise<{ status: number; receipt?: any; latest_receipt_info?: any[] }> {
    const url = sandbox ? APPLE_VERIFY_SANDBOX : APPLE_VERIFY_PRODUCTION;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receiptData,
        password,
        'exclude-old-transactions': true,
      }),
    });
    return res.json();
  }
}
