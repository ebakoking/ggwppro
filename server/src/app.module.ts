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
import { HealthController } from './health.controller';
// seed controller removed after initial seeding

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    MailModule,
    AuthModule,
    ProfileModule,
    GameModule,
    DiscoverModule,
    SwipeModule,
    MatchModule,
    MessageModule,
    ForumModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
