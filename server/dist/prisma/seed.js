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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const games = [
    { name: 'Genel', slug: 'genel', category: client_1.GameCategory.OTHER },
    { name: 'PUBG Mobile', slug: 'pubg-mobile', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200' },
    { name: 'Call of Duty Mobile', slug: 'cod-mobile', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=200' },
    { name: 'Free Fire', slug: 'free-fire', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200' },
    { name: 'Mobile Legends', slug: 'mobile-legends', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200' },
    { name: 'Clash Royale', slug: 'clash-royale', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=200' },
    { name: 'Brawl Stars', slug: 'brawlstars', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200' },
    { name: 'Wild Rift', slug: 'wildrift', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200' },
    { name: 'Arena Breakout', slug: 'arena-breakout', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200' },
    { name: 'Standoff 2', slug: 'standoff-2', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=200' },
    { name: 'Among Us', slug: 'among-us', category: client_1.GameCategory.OTHER, iconUrl: 'https://images.unsplash.com/photo-1585620385456-4a0a5e906fcf?w=200' },
    { name: 'Valorant', slug: 'valorant', category: client_1.GameCategory.FPS, iconUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200' },
    { name: 'League of Legends', slug: 'lol', category: client_1.GameCategory.MOBA, iconUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=200' },
    { name: 'Counter-Strike 2', slug: 'cs2', category: client_1.GameCategory.FPS, iconUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=200' },
    { name: 'Dota 2', slug: 'dota2', category: client_1.GameCategory.MOBA, iconUrl: 'https://images.unsplash.com/photo-1548686304-89d188a80029?w=200' },
    { name: 'Fortnite', slug: 'fortnite', category: client_1.GameCategory.BATTLE_ROYALE, iconUrl: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=200' },
    { name: 'Apex Legends', slug: 'apex', category: client_1.GameCategory.BATTLE_ROYALE, iconUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=200' },
    { name: 'Overwatch 2', slug: 'overwatch2', category: client_1.GameCategory.FPS, iconUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200' },
    { name: 'Rainbow Six Siege', slug: 'r6siege', category: client_1.GameCategory.FPS, iconUrl: 'https://images.unsplash.com/photo-1605479695026-6f7602307820?w=200' },
    { name: 'Rust', slug: 'rust', category: client_1.GameCategory.SANDBOX, iconUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200' },
    { name: 'PUBG Battlegrounds', slug: 'pubg', category: client_1.GameCategory.BATTLE_ROYALE, iconUrl: 'https://images.unsplash.com/photo-1594652634010-275456c808d0?w=200' },
    { name: 'Call of Duty Warzone', slug: 'warzone', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1616588589676-62b3d4ff6398?w=200' },
    { name: 'EA Sports FC', slug: 'eafc', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200' },
    { name: 'NBA 2K', slug: 'nba2k', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200' },
    { name: 'Rocket League', slug: 'rocket-league', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200' },
    { name: 'Destiny 2', slug: 'destiny-2', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=200' },
    { name: 'Halo Infinite', slug: 'halo-infinite', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1563224512-5a51ce12f0db?w=200' },
    { name: 'GTA Online', slug: 'gtav', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200' },
    { name: 'Tekken 8', slug: 'tekken-8', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1555864326-5cf22ef123cf?w=200' },
    { name: 'Street Fighter 6', slug: 'street-fighter-6', category: client_1.GameCategory.SPORTS, iconUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200' },
    { name: 'Minecraft', slug: 'minecraft', category: client_1.GameCategory.SANDBOX, iconUrl: 'https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=200' },
    { name: 'Genshin Impact', slug: 'genshin', category: client_1.GameCategory.RPG, iconUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=200' },
    { name: 'TFT', slug: 'tft', category: client_1.GameCategory.STRATEGY, iconUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=200' },
    { name: 'Roblox', slug: 'roblox', category: client_1.GameCategory.SANDBOX, iconUrl: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=200' },
    { name: 'World of Warcraft', slug: 'wow', category: client_1.GameCategory.RPG, iconUrl: 'https://images.unsplash.com/photo-1559363367-45b7c59d08e3?w=200' },
];
const testUsers = [
    { email: 'test1@ggwp.app', username: 'FrostByte', displayName: 'FrostByte', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.TRYHARD, usesMic: true, bio: 'Ranked grinder. Plat hedefi var.', dob: '2001-05-14', gameSlugs: ['valorant', 'cs2', 'lol'] },
    { email: 'test2@ggwp.app', username: 'ShadowLily', displayName: 'ShadowLily', gender: client_1.Gender.FEMALE, playStyle: client_1.PlayStyle.CHILL, usesMic: true, bio: 'Chill oyuncu arıyorum. Gece sessiz farm.', dob: '2000-11-22', gameSlugs: ['lol', 'genshin', 'minecraft'] },
    { email: 'test3@ggwp.app', username: 'ToxicFreeZone', displayName: 'ToxicFreeZone', gender: client_1.Gender.OTHER, playStyle: client_1.PlayStyle.CHILL, usesMic: false, bio: 'Toksik olmayanlar buyrun. Peace & GG.', dob: '1999-03-08', gameSlugs: ['valorant', 'apex', 'overwatch2'] },
    { email: 'test4@ggwp.app', username: 'NightOwlTR', displayName: 'NightOwl', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.TRYHARD, usesMic: true, bio: 'Gece kuşu. 00:00-06:00 arası aktif.', dob: '2002-07-30', gameSlugs: ['cs2', 'pubg', 'warzone'] },
    { email: 'test5@ggwp.app', username: 'MidOrFeed', displayName: 'MidOrFeed', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.TRYHARD, usesMic: true, bio: 'Mid main. Diamond hedefindeyim.', dob: '2001-01-17', gameSlugs: ['lol', 'tft', 'wildrift'] },
    { email: 'test6@ggwp.app', username: 'CozyGamer', displayName: 'CozyGamer', gender: client_1.Gender.FEMALE, playStyle: client_1.PlayStyle.CHILL, usesMic: false, bio: 'Chill builderım. Minecraft ve RPG severim.', dob: '2003-09-05', gameSlugs: ['minecraft', 'genshin', 'roblox'] },
    { email: 'test7@ggwp.app', username: 'AceSniper', displayName: 'AceSniper', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.TRYHARD, usesMic: true, bio: 'Aim antrenmanı her gün. FPS dışı oynamam.', dob: '2000-12-25', gameSlugs: ['valorant', 'cs2', 'r6siege', 'overwatch2'] },
    { email: 'test8@ggwp.app', username: 'SupportMain', displayName: 'SupportMain', gender: client_1.Gender.FEMALE, playStyle: client_1.PlayStyle.CHILL, usesMic: true, bio: 'Support/Healer main. Takım oyuncusu.', dob: '2002-04-18', gameSlugs: ['lol', 'overwatch2', 'dota2'] },
    { email: 'test9@ggwp.app', username: 'RocketKing', displayName: 'RocketKing', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.TRYHARD, usesMic: false, bio: 'Grand Champion. Freestyle clip peşindeyim.', dob: '1998-08-12', gameSlugs: ['rocket-league', 'eafc', 'fortnite'] },
    { email: 'test10@ggwp.app', username: 'ZenPlayer', displayName: 'ZenPlayer', gender: client_1.Gender.OTHER, playStyle: client_1.PlayStyle.CHILL, usesMic: true, bio: 'Her oyunu oynarım. Eğlence her şeyden önce.', dob: '2001-06-02', gameSlugs: ['minecraft', 'gtav', 'wow', 'genshin', 'lol'] },
    { email: 'test11@ggwp.app', username: 'Asli', displayName: 'Asli', gender: client_1.Gender.FEMALE, playStyle: client_1.PlayStyle.COMPETITIVE, usesMic: true, bio: 'Valorant oynamayı seviyorum! Takım oyuncusuyum, her gün akşam saatlerinde aktifim.', dob: '2000-06-15', gameSlugs: ['valorant', 'lol'], avatarUrl: 'https://images.unsplash.com/photo-1718056514261-bb037cfe6ddd?w=400' },
    { email: 'test12@ggwp.app', username: 'NeonStriker', displayName: 'NeonStriker', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.COMPETITIVE, usesMic: true, bio: 'FPS main. Ranked grind.', dob: '1999-03-22', gameSlugs: ['valorant', 'cs2', 'overwatch2'], avatarUrl: 'https://images.unsplash.com/photo-1618517048485-f125b94309a8?w=400' },
    { email: 'test13@ggwp.app', username: 'LunaVibe', displayName: 'Luna', gender: client_1.Gender.FEMALE, playStyle: client_1.PlayStyle.CASUAL, usesMic: true, bio: 'Chill oyunlar, sohbet severim.', dob: '2002-11-08', gameSlugs: ['minecraft', 'genshin', 'lol'], avatarUrl: 'https://images.unsplash.com/photo-1759701546957-0ac6e568bd9a?w=400' },
    { email: 'test14@ggwp.app', username: 'CyberPunk', displayName: 'Cyber', gender: client_1.Gender.OTHER, playStyle: client_1.PlayStyle.TEAM_PLAYER, usesMic: true, bio: 'Takım oyunu için buradayım.', dob: '2001-07-30', gameSlugs: ['lol', 'valorant', 'dota2'], avatarUrl: 'https://images.unsplash.com/photo-1613487971624-24f87ffdbfc5?w=400' },
    { email: 'test15@ggwp.app', username: 'StreamQueen', displayName: 'StreamQueen', gender: client_1.Gender.FEMALE, playStyle: client_1.PlayStyle.CASUAL, usesMic: true, bio: 'Yayıncıyım, eğlence için oynuyorum.', dob: '2003-01-12', gameSlugs: ['valorant', 'fortnite', 'minecraft'], avatarUrl: 'https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=400' },
    { email: 'test16@ggwp.app', username: 'ApexHunter', displayName: 'ApexHunter', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.COMPETITIVE, usesMic: true, bio: 'Apex ve BR oyunları. Pred hedefi.', dob: '2000-09-25', gameSlugs: ['valorant', 'apex', 'pubg'], avatarUrl: 'https://images.unsplash.com/photo-1759701546662-b79f5d881124?w=400' },
    { email: 'test17@ggwp.app', username: 'MinecraftMom', displayName: 'MineMom', gender: client_1.Gender.FEMALE, playStyle: client_1.PlayStyle.CASUAL, usesMic: false, bio: 'Minecraft ve sakin oyunlar.', dob: '1998-12-05', gameSlugs: ['minecraft', 'roblox', 'genshin'], avatarUrl: 'https://images.unsplash.com/photo-1771014817844-327a14245bd1?w=400' },
    { email: 'test18@ggwp.app', username: 'DiamondDream', displayName: 'Diamond', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.COMPETITIVE, usesMic: true, bio: 'LoL Diamond. Duo arıyorum.', dob: '2001-04-18', gameSlugs: ['lol', 'tft', 'wildrift'], avatarUrl: 'https://images.unsplash.com/photo-1772371272167-0117a6573d58?w=400' },
    { email: 'test19@ggwp.app', username: 'VRGamer', displayName: 'VR', gender: client_1.Gender.OTHER, playStyle: client_1.PlayStyle.EXPLORER, usesMic: true, bio: 'Yeni oyunlar denemeyi seviyorum.', dob: '2002-08-20', gameSlugs: ['minecraft', 'gtav', 'valorant'], avatarUrl: 'https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=400' },
    { email: 'test20@ggwp.app', username: 'NightFury', displayName: 'Fury', gender: client_1.Gender.MALE, playStyle: client_1.PlayStyle.TEAM_PLAYER, usesMic: true, bio: 'Gece oyuncusu. Takım oyunu.', dob: '1999-05-14', gameSlugs: ['cs2', 'valorant', 'r6siege'], avatarUrl: 'https://images.unsplash.com/photo-1543868519-fc5437bc63fe?w=400' },
];
async function main() {
    console.log('Seeding game catalog...');
    const gameMap = {};
    for (const g of games) {
        const { iconUrl, ...rest } = g;
        const result = await prisma.gameCatalog.upsert({
            where: { slug: g.slug },
            update: { name: g.name, category: g.category, ...(iconUrl ? { iconUrl } : {}) },
            create: { ...rest, ...(iconUrl ? { iconUrl } : {}) },
        });
        gameMap[g.slug] = result.id;
    }
    console.log(`Seeded ${games.length} games.`);
    const password = await bcrypt.hash('test123', 12);
    console.log('Creating test users...');
    for (const u of testUsers) {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (existing) {
            console.log(`  Skipping ${u.username} (exists)`);
            continue;
        }
        const profileData = {
            displayName: u.displayName,
            gender: u.gender,
            playStyle: u.playStyle,
            usesMic: u.usesMic,
            bio: u.bio,
            dateOfBirth: new Date(u.dob),
        };
        if (u.avatarUrl)
            profileData.avatarUrl = u.avatarUrl;
        const user = await prisma.user.create({
            data: {
                email: u.email,
                username: u.username,
                passwordHash: password,
                emailVerified: true,
                profile: { create: profileData },
            },
        });
        for (const slug of u.gameSlugs) {
            const gid = gameMap[slug];
            if (gid) {
                await prisma.userGame.create({
                    data: { userId: user.id, gameId: gid },
                }).catch(() => { });
            }
        }
        console.log(`  Created ${u.username} with ${u.gameSlugs.length} games`);
    }
    await prisma.user.updateMany({
        where: { email: { in: testUsers.map((u) => u.email) } },
        data: { emailVerified: true },
    });
    console.log('Seeding complete!');
    console.log('\nTest accounts (password: test123):');
    testUsers.forEach((u) => console.log(`  ${u.email} / ${u.username}`));
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map