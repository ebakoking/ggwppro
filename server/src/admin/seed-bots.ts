import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const AVATARS_FEMALE = [
  'https://images.unsplash.com/photo-1718056514261-bb037cfe6ddd?w=400',
  'https://images.unsplash.com/photo-1759701546957-0ac6e568bd9a?w=400',
  'https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=400',
  'https://images.unsplash.com/photo-1771014817844-327a14245bd1?w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
];

const AVATARS_MALE = [
  'https://images.unsplash.com/photo-1618517048485-f125b94309a8?w=400',
  'https://images.unsplash.com/photo-1613487971624-24f87ffdbfc5?w=400',
  'https://images.unsplash.com/photo-1772371272167-0117a6573d58?w=400',
  'https://images.unsplash.com/photo-1759701546662-b79f5d881124?w=400',
  'https://images.unsplash.com/photo-1543868519-fc5437bc63fe?w=400',
  'https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
];

const DISPLAY_NAMES_F = [
  'Elif', 'Zeynep', 'Selin', 'Ayşe', 'Buse', 'Melis', 'Derya', 'İrem', 'Ceren', 'Esra',
  'Damla', 'Gizem', 'Büşra', 'Tuğçe', 'Hande', 'Pelin', 'Merve', 'Cansu', 'Deniz', 'Ecem',
  'Nil', 'Yağmur', 'Başak', 'Dila', 'Ebru', 'Gül', 'Hazal', 'İlayda', 'Ece', 'Aslı',
  'Naz', 'Beyza', 'Şeyma', 'Gamze', 'Kardelen',
];

const DISPLAY_NAMES_M = [
  'Kaan', 'Burak', 'Arda', 'Emre', 'Cem', 'Berk', 'Yiğit', 'Mert', 'Ali', 'Oğuz',
  'Onur', 'Tolga', 'Serkan', 'Barış', 'Furkan', 'Umut', 'Tuna', 'Deniz', 'Efe', 'Koray',
  'Sinan', 'Can', 'Doruk', 'Alp', 'Batuhan', 'Ege', 'Kerem', 'Utku', 'Taylan', 'Hakan',
  'Ozan', 'Selim', 'Erdem', 'Fatih', 'Volkan', 'Murat', 'İlker', 'Rüzgar', 'Çağatay', 'Berkay',
  'Atlas', 'Eren', 'Görkem', 'İlhan', 'Kağan', 'Taner', 'Ulaş', 'Yusuf', 'Aras', 'Caner',
  'Doğan', 'Eyüp', 'Gökhan', 'Hamza', 'İsmail', 'Kadir', 'Levent', 'Mesut', 'Necati', 'Orhan',
];

const BIOS = [
  'Ranked grinder. Her gece aktifim.',
  'Chill oyuncu, eğlence için buradayım.',
  'Takım arıyorum, sesli iletişim şart.',
  'FPS main, aim pratik her gün.',
  'Duo/trio arıyorum. GG only.',
  'Yeni oyunlar denemeyi seviyorum.',
  'Gece kuşuyum, 22:00 sonrası aktif.',
  'Sadece eğlence, toxic olmayan arkadaş arıyorum.',
  'Rekabetçi oyuncu. Kazanmak için oynuyorum.',
  'Support main. Takım oyuncusu.',
  'RPG ve açık dünya seviyorum.',
  'Hafta sonları full aktif.',
  'Türk oyuncu arıyorum, Türkçe sohbet.',
  'BR oyunları seviyorum. Her gün online.',
  'Mobil oyuncu, telefon başında.',
];

const GAME_SLUGS = [
  'valorant', 'lol', 'cs2', 'pubg-mobile', 'fortnite', 'apex', 'minecraft',
  'overwatch2', 'dota2', 'genshin', 'cod-mobile', 'free-fire', 'wildrift',
  'r6siege', 'rocket-league', 'roblox', 'pubg', 'warzone', 'eafc', 'tft',
  'brawlstars', 'mobile-legends', 'clash-royale', 'among-us', 'genel',
  'arena-breakout', 'standoff-2', 'rust', 'nba2k', 'destiny-2',
  'halo-infinite', 'gtav', 'tekken-8', 'street-fighter-6', 'wow',
];

const PLAY_STYLES = ['COMPETITIVE', 'CASUAL', 'TEAM_PLAYER', 'EXPLORER', 'TRYHARD', 'CHILL'];
const GENDERS = ['MALE', 'FEMALE'];
const GAME_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function randomDob(): string {
  const year = 1996 + Math.floor(Math.random() * 8);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export async function seedBots(prisma: PrismaService, count = 100) {
  const allGames = await prisma.gameCatalog.findMany();
  const slugToId: Record<string, string> = {};
  allGames.forEach((g) => { slugToId[g.slug] = g.id; });

  const passwordHash = await bcrypt.hash('bot12345', 12);
  let created = 0;
  let maleIdx = 0;
  let femaleIdx = 0;

  for (let i = 0; i < count; i++) {
    const gender = GENDERS[i % 2];
    const isFemale = gender === 'FEMALE';
    const displayName = isFemale
      ? DISPLAY_NAMES_F[femaleIdx++ % DISPLAY_NAMES_F.length]
      : DISPLAY_NAMES_M[maleIdx++ % DISPLAY_NAMES_M.length];
    const username = `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}${100 + i}`;
    const email = `bot${100 + i}@ggwp.bot`;
    const avatarUrl = isFemale
      ? AVATARS_FEMALE[i % AVATARS_FEMALE.length]
      : AVATARS_MALE[i % AVATARS_MALE.length];

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) continue;

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        emailVerified: true,
        profile: {
          create: {
            displayName,
            gender: gender as any,
            playStyle: pick(PLAY_STYLES) as any,
            gameLevel: pick(GAME_LEVELS) as any,
            usesMic: Math.random() > 0.3,
            bio: pick(BIOS),
            dateOfBirth: new Date(randomDob()),
            avatarUrl,
          },
        },
      },
    });

    const gameSlugs = pickN(GAME_SLUGS, 2 + Math.floor(Math.random() * 4));
    for (const slug of gameSlugs) {
      const gid = slugToId[slug];
      if (gid) {
        await prisma.userGame.create({ data: { userId: user.id, gameId: gid } }).catch(() => {});
      }
    }
    created++;
  }

  // Botlar rastgele gerçek kullanıcıları like'lasın
  const botUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@ggwp.bot' } },
    select: { id: true },
  });
  const realUsers = await prisma.user.findMany({
    where: { email: { not: { endsWith: '@ggwp.bot' } } },
    select: { id: true },
  });

  let likesCreated = 0;
  if (realUsers.length > 0 && allGames.length > 0) {
    for (const bot of botUsers) {
      for (const real of realUsers) {
        if (Math.random() < 0.6) {
          const gameId = pick(allGames).id;
          await prisma.swipe.upsert({
            where: { fromId_toId_gameId: { fromId: bot.id, toId: real.id, gameId } },
            update: {},
            create: { fromId: bot.id, toId: real.id, action: 'LIKE', gameId },
          }).catch(() => {});
          likesCreated++;
        }
      }
    }
  }

  return { botsCreated: created, likesCreated };
}
