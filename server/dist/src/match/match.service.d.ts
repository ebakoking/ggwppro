import { PrismaService } from '../prisma/prisma.service';
export declare class MatchService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyMatches(userId: string, gameId?: string): Promise<{
        matchId: string;
        game: {
            id: string;
            name: string;
            slug: string;
            iconUrl: string | null;
            category: import(".prisma/client").$Enums.GameCategory;
        };
        createdAt: Date;
        otherUser: {
            id: string;
            username: string;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                displayName: string | null;
                avatarUrl: string | null;
                dateOfBirth: Date | null;
                gender: import(".prisma/client").$Enums.Gender | null;
                playStyle: import(".prisma/client").$Enums.PlayStyle | null;
                gameLevel: import(".prisma/client").$Enums.GameLevel | null;
                usesMic: boolean;
                bio: string | null;
                isPremium: boolean;
                premiumPlan: string | null;
                premiumExpiresAt: Date | null;
                pentakillsLeft: number;
                dailyLikesUsed: number;
                lastLikeResetAt: Date;
                filterGender: string | null;
                filterAgeMin: number | null;
                filterAgeMax: number | null;
                filterMicOnly: boolean;
                filterPlayStyles: string[];
                filterActivity: string | null;
                userId: string;
            } | null;
        };
        lastMessage: {
            id: string;
            createdAt: Date;
            matchId: string;
            senderId: string;
            content: string;
            messageType: string;
            audioUrl: string | null;
            read: boolean;
        };
    }[]>;
}
