import { Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const GAMES = [
  { name: 'Genel', slug: 'genel', category: 'OTHER' },
  { name: 'PUBG Mobile', slug: 'pubg-mobile', category: 'OTHER' },
  { name: 'Call of Duty Mobile', slug: 'cod-mobile', category: 'OTHER' },
  { name: 'Free Fire', slug: 'free-fire', category: 'OTHER' },
  { name: 'Mobile Legends', slug: 'mobile-legends', category: 'OTHER' },
  { name: 'Clash Royale', slug: 'clash-royale', category: 'OTHER' },
  { name: 'Brawl Stars', slug: 'brawlstars', category: 'OTHER' },
  { name: 'Wild Rift', slug: 'wildrift', category: 'OTHER' },
  { name: 'Arena Breakout', slug: 'arena-breakout', category: 'OTHER' },
  { name: 'Standoff 2', slug: 'standoff-2', category: 'OTHER' },
  { name: 'Among Us', slug: 'among-us', category: 'OTHER' },
  { name: 'Valorant', slug: 'valorant', category: 'FPS' },
  { name: 'League of Legends', slug: 'lol', category: 'MOBA' },
  { name: 'Counter-Strike 2', slug: 'cs2', category: 'FPS' },
  { name: 'Dota 2', slug: 'dota2', category: 'MOBA' },
  { name: 'Fortnite', slug: 'fortnite', category: 'BATTLE_ROYALE' },
  { name: 'Apex Legends', slug: 'apex', category: 'BATTLE_ROYALE' },
  { name: 'Overwatch 2', slug: 'overwatch2', category: 'FPS' },
  { name: 'Rainbow Six Siege', slug: 'r6siege', category: 'FPS' },
  { name: 'Rust', slug: 'rust', category: 'SANDBOX' },
  { name: 'PUBG Battlegrounds', slug: 'pubg', category: 'BATTLE_ROYALE' },
  { name: 'Call of Duty Warzone', slug: 'warzone', category: 'SPORTS' },
  { name: 'EA Sports FC', slug: 'eafc', category: 'SPORTS' },
  { name: 'NBA 2K', slug: 'nba2k', category: 'SPORTS' },
  { name: 'Rocket League', slug: 'rocket-league', category: 'SPORTS' },
  { name: 'Destiny 2', slug: 'destiny-2', category: 'SPORTS' },
  { name: 'Halo Infinite', slug: 'halo-infinite', category: 'SPORTS' },
  { name: 'GTA Online', slug: 'gtav', category: 'SPORTS' },
  { name: 'Tekken 8', slug: 'tekken-8', category: 'SPORTS' },
  { name: 'Street Fighter 6', slug: 'street-fighter-6', category: 'SPORTS' },
  { name: 'Minecraft', slug: 'minecraft', category: 'SANDBOX' },
  { name: 'Genshin Impact', slug: 'genshin', category: 'RPG' },
  { name: 'TFT', slug: 'tft', category: 'STRATEGY' },
  { name: 'Roblox', slug: 'roblox', category: 'SANDBOX' },
  { name: 'World of Warcraft', slug: 'wow', category: 'RPG' },
];

const TEST_USERS = [
  { email: 'test1@ggwp.app', username: 'FrostByte', displayName: 'FrostByte', gender: 'MALE', playStyle: 'TRYHARD', usesMic: true, bio: 'Ranked grinder. Plat hedefi var.', dob: '2001-05-14', gameSlugs: ['valorant', 'cs2', 'lol'] },
  { email: 'test2@ggwp.app', username: 'ShadowLily', displayName: 'ShadowLily', gender: 'FEMALE', playStyle: 'CHILL', usesMic: true, bio: 'Chill oyuncu arıyorum.', dob: '2000-11-22', gameSlugs: ['lol', 'genshin', 'minecraft'] },
  { email: 'test3@ggwp.app', username: 'ToxicFreeZone', displayName: 'ToxicFreeZone', gender: 'OTHER', playStyle: 'CHILL', usesMic: false, bio: 'Peace & GG.', dob: '1999-03-08', gameSlugs: ['valorant', 'apex', 'overwatch2'] },
  { email: 'test4@ggwp.app', username: 'NightOwlTR', displayName: 'NightOwl', gender: 'MALE', playStyle: 'TRYHARD', usesMic: true, bio: 'Gece kuşu. 00:00-06:00 arası aktif.', dob: '2002-07-30', gameSlugs: ['cs2', 'pubg', 'warzone'] },
  { email: 'test5@ggwp.app', username: 'MidOrFeed', displayName: 'MidOrFeed', gender: 'MALE', playStyle: 'TRYHARD', usesMic: true, bio: 'Mid main. Diamond hedefindeyim.', dob: '2001-01-17', gameSlugs: ['lol', 'tft', 'wildrift'] },
  { email: 'test6@ggwp.app', username: 'CozyGamer', displayName: 'CozyGamer', gender: 'FEMALE', playStyle: 'CHILL', usesMic: false, bio: 'Minecraft ve RPG severim.', dob: '2003-09-05', gameSlugs: ['minecraft', 'genshin', 'roblox'] },
  { email: 'test7@ggwp.app', username: 'AceSniper', displayName: 'AceSniper', gender: 'MALE', playStyle: 'TRYHARD', usesMic: true, bio: 'Aim antrenmanı her gün.', dob: '2000-12-25', gameSlugs: ['valorant', 'cs2', 'r6siege'] },
  { email: 'test8@ggwp.app', username: 'SupportMain', displayName: 'SupportMain', gender: 'FEMALE', playStyle: 'CHILL', usesMic: true, bio: 'Support/Healer main.', dob: '2002-04-18', gameSlugs: ['lol', 'overwatch2', 'dota2'] },
  { email: 'test9@ggwp.app', username: 'RocketKing', displayName: 'RocketKing', gender: 'MALE', playStyle: 'TRYHARD', usesMic: false, bio: 'Grand Champion.', dob: '1998-08-12', gameSlugs: ['rocket-league', 'eafc', 'fortnite'] },
  { email: 'test10@ggwp.app', username: 'ZenPlayer', displayName: 'ZenPlayer', gender: 'OTHER', playStyle: 'CHILL', usesMic: true, bio: 'Her oyunu oynarım. Eğlence.', dob: '2001-06-02', gameSlugs: ['minecraft', 'gtav', 'wow'] },
];

@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async seed() {
    const gameMap: Record<string, string> = {};

    for (const g of GAMES) {
      const result = await this.prisma.gameCatalog.upsert({
        where: { slug: g.slug },
        update: { name: g.name, category: g.category as any },
        create: { name: g.name, slug: g.slug, category: g.category as any },
      });
      gameMap[g.slug] = result.id;
    }

    const passwordHash = await bcrypt.hash('test123', 12);
    let created = 0;

    for (const u of TEST_USERS) {
      const exists = await this.prisma.user.findUnique({ where: { email: u.email } });
      if (exists) continue;

      const user = await this.prisma.user.create({
        data: {
          email: u.email,
          username: u.username,
          passwordHash,
          emailVerified: true,
          profile: {
            create: {
              displayName: u.displayName,
              gender: u.gender as any,
              playStyle: u.playStyle as any,
              usesMic: u.usesMic,
              bio: u.bio,
              dateOfBirth: new Date(u.dob),
            },
          },
        },
      });

      for (const slug of u.gameSlugs) {
        const gid = gameMap[slug];
        if (gid) {
          await this.prisma.userGame.create({
            data: { userId: user.id, gameId: gid },
          }).catch(() => {});
        }
      }
      created++;
    }

    return {
      ok: true,
      gamesSeeded: GAMES.length,
      usersCreated: created,
      message: 'Seed tamamlandi! Bu endpoint artik guvenli bir sekilde kaldirabilirsiniz.',
    };
  }
}
