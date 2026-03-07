import { SwipeAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class SwipeService {
    private prisma;
    constructor(prisma: PrismaService);
    swipe(fromId: string, toId: string, action: SwipeAction, gameId: string): Promise<{
        swipe: {
            id: string;
            fromId: string;
            toId: string;
            action: import(".prisma/client").$Enums.SwipeAction;
            gameId: string;
            createdAt: Date;
        };
        matched: boolean;
    }>;
    getWhoLikedMe(userId: string, gameId: string): Promise<({
        from: {
            id: string;
            username: string;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
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
            } | null;
        };
    } & {
        id: string;
        fromId: string;
        toId: string;
        action: import(".prisma/client").$Enums.SwipeAction;
        gameId: string;
        createdAt: Date;
    })[]>;
}
