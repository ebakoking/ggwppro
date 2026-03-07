import { PrismaClient, Gender, PlayStyle } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const GENDERS: Gender[] = [Gender.MALE, Gender.FEMALE, Gender.OTHER];
const PLAY_STYLES: PlayStyle[] = [
  PlayStyle.TRYHARD,
  PlayStyle.CHILL,
  PlayStyle.COMPETITIVE,
  PlayStyle.CASUAL,
  PlayStyle.TEAM_PLAYER,
  PlayStyle.EXPLORER,
];

const GAME_SLUGS = [
  'valorant', 'lol', 'cs2', 'dota2', 'fortnite', 'apex', 'overwatch2',
  'r6siege', 'rust', 'pubg', 'minecraft', 'genshin', 'tft', 'roblox',
  'wow', 'pubg-mobile', 'cod-mobile', 'free-fire', 'mobile-legends',
  'brawlstars', 'wildrift', 'rocket-league', 'eafc', 'gtav',
];

const MALE_NAMES = [
  'Kaan', 'Efe', 'Burak', 'Emre', 'Arda', 'Mert', 'Yusuf', 'Berk', 'Deniz',
  'Alp', 'Can', 'Barış', 'Onur', 'Tolga', 'Serkan', 'Hakan', 'Erdem',
  'Ozan', 'Tarik', 'Umut', 'Çağrı', 'Doruk', 'Kerem', 'Volkan', 'Sarp',
  'Aras', 'Koray', 'Tuna', 'Selim', 'Batuhan', 'Furkan', 'Görkem', 'İlker',
  'Levent', 'Murat', 'Necati', 'Orhan', 'Polat', 'Rıza', 'Sinan',
  'Taylan', 'Uğur', 'Yiğit', 'Zafer', 'Adem', 'Bilal', 'Cemal', 'Davut',
];

const FEMALE_NAMES = [
  'Elif', 'Zeynep', 'Ayşe', 'Selin', 'Merve', 'Damla', 'Esra', 'Naz',
  'Gizem', 'Buse', 'Pelin', 'Dilan', 'Ceren', 'İrem', 'Nehir', 'Şeyma',
  'Eda', 'Yağmur', 'Derya', 'Melis', 'Burcu', 'Cansu', 'Didem', 'Eylül',
  'Funda', 'Gülşah', 'Hazal', 'İpek', 'Jale', 'Kardelen', 'Lale', 'Mine',
  'Nur', 'Özge', 'Pınar', 'Rana', 'Simge', 'Tuğba', 'Ülkü', 'Vildan',
  'Yasemin', 'Zülal', 'Aslıhan', 'Bahar', 'Cemre', 'Defne', 'Ebru', 'Fulya',
];

const OTHER_NAMES = [
  'Rüzgar', 'Toprak', 'Çınar', 'Masal', 'Derin', 'Evren', 'Güneş',
  'Ilgın', 'Kumru', 'Ladin', 'Nehir', 'Özgür', 'Poyraz', 'Selen',
];

const TAGS_M = [
  'xKral', 'Pro', '_TR', 'Usta', '_GG', 'Legend', 'Boss', 'Wolf', 'Storm',
  'Fire', 'Ice', 'Dark', 'Night', 'Shadow', 'Ace', 'King', 'Sniper', 'Hawk',
  'Thunder', 'Blade', 'Ghost', 'Venom', 'Titan', 'Fury', 'Rage', 'Blaze',
];

const TAGS_F = [
  'Queen', 'Star', '_xo', 'Vibe', 'Glow', 'Luna', 'Pixel', 'Neon',
  'Bloom', 'Spark', 'Dream', 'Angel', 'Cute', 'Rose', 'Sky', 'Gem',
  'Crystal', 'Mystic', 'Fairy', 'Shine', 'Diva', 'Sweet', 'Honey', 'Magic',
];

const BIOS_MALE = [
  'Ranked grind yapıyorum, duo arıyorum.',
  'FPS dışı bir şey oynamam. AWP main.',
  'Gece kuşu, 23:00 sonrası aktif.',
  'Takım oyuncusu, iletişim önemli.',
  'Eğlenmek için oynuyorum ama kazanmak da güzel.',
  'Diamond hedefindeyim, ciddi duo lazım.',
  'Tilt olmam, pozitif oyuncu.',
  'Her türlü oyun oynarım, eğlence öncelik.',
  'Competitive player, scrim arıyorum.',
  'Chill adam, farm yaparız.',
  'Taktik seven, stratejist oyuncu.',
  'Solo q canıma tak etti, duo lazım.',
  'FPS + MOBA ikisini de oynarım.',
  'Yayın açıyorum bazen, takılalım.',
  'Sabah erken aktifim, sabahçı duo arıyorum.',
  'Mikrofon her zaman açık, iletişim şart.',
  'Toxic ortam istemiyorum, sakin takılalım.',
  'İlk kez bu uygulamayı deniyorum, bakalım.',
  'Haftasonu tüm gün oyundayım.',
  'Eski CS oyuncusu, Valorant\'a geçtim.',
];

const BIOS_FEMALE = [
  'Chill oyuncu, sohbet ederek oynarım.',
  'Valorant ve LoL oynuyorum, duo lazım.',
  'Support main, takıma katkı severim.',
  'Gece oyunları, müzikli chill.',
  'Minecraft builder, yaratıcı projeler.',
  'Yeni başladım, öğretecek biri lazım.',
  'Rekabetçi oyuncu, rankım Diamond.',
  'Eğlenceli takım arıyorum.',
  'RPG ve açık dünya oyunları seviyorum.',
  'Mikrofon açık, sohbet ederek oynamak istiyorum.',
  'Oyun benim stres atma yöntemim.',
  'Hafta içi akşamları müsaitim.',
  'Twitch yayıncısıyım, beraber yayın yapalım.',
  'Toxic olmayan takım arkadaşı arıyorum.',
  'Her oyunu denerim, yeni keşifler güzel.',
  'Sabahçı oyuncuyum, erken saatlerde aktif.',
  'Genshin ve anime oyunları favorim.',
  'Rekabetçi ama eğlenceli oyun istiyorum.',
  'Grup oyunlarını seviyorum, 5 kişilik takım kuralım.',
  'Sesli iletişim tercih ediyorum.',
];

const BIOS_OTHER = [
  'Her oyunu oynarım, eğlence her şeyden önce.',
  'Takım oyuncusu, iletişim önemli.',
  'Keşifçi ruh, yeni oyunlar denemeyi seviyorum.',
  'Chill ve competitive arası bir yerdeyim.',
  'Oyun topluluğu oluşturmak istiyorum.',
  'Non-binary gamer, herkes hoşgeldin.',
  'Sanat ve oyun birleşimi, yaratıcı oyunlar.',
  'Gece kuşu, sessiz farm.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface BotDef {
  email: string;
  username: string;
  displayName: string;
  gender: Gender;
  playStyle: PlayStyle;
  usesMic: boolean;
  bio: string;
  dob: string;
  gameSlugs: string[];
}

function generateBots(count: number): BotDef[] {
  const bots: BotDef[] = [];
  const usedUsernames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const genderRoll = Math.random();
    let gender: Gender;
    let firstName: string;
    let tag: string;
    let bio: string;

    if (genderRoll < 0.45) {
      gender = Gender.MALE;
      firstName = pick(MALE_NAMES);
      tag = pick(TAGS_M);
      bio = pick(BIOS_MALE);
    } else if (genderRoll < 0.85) {
      gender = Gender.FEMALE;
      firstName = pick(FEMALE_NAMES);
      tag = pick(TAGS_F);
      bio = pick(BIOS_FEMALE);
    } else {
      gender = Gender.OTHER;
      firstName = pick(OTHER_NAMES);
      tag = pick([...TAGS_M, ...TAGS_F]);
      bio = pick(BIOS_OTHER);
    }

    let username = `${firstName}${tag}${randInt(1, 99)}`;
    while (usedUsernames.has(username)) {
      username = `${firstName}${tag}${randInt(100, 999)}`;
    }
    usedUsernames.add(username);

    const age = randInt(18, 35);
    const birthYear = 2026 - age;
    const month = String(randInt(1, 12)).padStart(2, '0');
    const day = String(randInt(1, 28)).padStart(2, '0');

    const numGames = randInt(1, 5);
    const gameSlugs = pickN(GAME_SLUGS, numGames);

    bots.push({
      email: `bot${i + 100}@ggwp.app`,
      username,
      displayName: firstName,
      gender,
      playStyle: pick(PLAY_STYLES),
      usesMic: Math.random() > 0.3,
      bio,
      dob: `${birthYear}-${month}-${day}`,
      gameSlugs,
    });
  }
  return bots;
}

async function main() {
  console.log('Loading game catalog...');
  const allGames = await prisma.gameCatalog.findMany();
  const gameMap: Record<string, string> = {};
  for (const g of allGames) {
    gameMap[g.slug] = g.id;
  }
  console.log(`Found ${allGames.length} games in catalog.`);

  const genel = gameMap['genel'];
  if (!genel) {
    console.error('ERROR: "genel" game not found. Run main seed first.');
    process.exit(1);
  }

  const password = await bcrypt.hash('bot123', 10);

  const bots = generateBots(150);
  console.log(`Creating ${bots.length} bot users...`);

  let created = 0;
  let skipped = 0;

  for (const bot of bots) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: bot.email }, { username: bot.username }] },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: bot.email,
        username: bot.username,
        passwordHash: password,
        emailVerified: true,
        profile: {
          create: {
            displayName: bot.displayName,
            gender: bot.gender,
            playStyle: bot.playStyle,
            usesMic: bot.usesMic,
            bio: bot.bio,
            dateOfBirth: new Date(bot.dob),
          },
        },
      },
    });

    const gameIds = [genel, ...bot.gameSlugs.map((s) => gameMap[s]).filter(Boolean)];
    const uniqueGameIds = [...new Set(gameIds)];
    for (const gid of uniqueGameIds) {
      await prisma.userGame.create({ data: { userId: user.id, gameId: gid } }).catch(() => {});
    }

    created++;
    if (created % 25 === 0) console.log(`  ${created} / ${bots.length} created...`);
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  console.log('Total bot accounts in DB now.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
