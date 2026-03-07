import { PrismaService } from '../prisma/prisma.service';
export declare class DiscoverService {
    private prisma;
    constructor(prisma: PrismaService);
    private getAge;
    private genderMap;
    getDiscoverFeed(userId: string, gameId: string | undefined, limit?: number): Promise<{
        user: any;
        compatibilityScore: number;
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
