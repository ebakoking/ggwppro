import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { GameModule } from './game/game.module';
import { DiscoverModule } from './discover/discover.module';
import { SwipeModule } from './swipe/swipe.module';
import { MatchModule } from './match/match.module';
import { MessageModule } from './message/message.module';
import { ForumModule } from './forum/forum.module';
import { ReportModule } from './report/report.module';
import { NotificationModule } from './notification/notification.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HealthController } from './health.controller';
import { AdminModule } from './admin/admin.module';
import { IapModule } from './iap/iap.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    MailModule,
    AuthModule,
    ProfileModule,
    IapModule,
    GameModule,
    DiscoverModule,
    SwipeModule,
    MatchModule,
    MessageModule,
    ForumModule,
    ReportModule,
    NotificationModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
