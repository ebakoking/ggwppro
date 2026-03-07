import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            userGames: ({
                game: {
                    id: string;
                    name: string;
                    slug: string;
                    iconUrl: string | null;
                    category: import(".prisma/client").$Enums.GameCategory;
                };
            } & {
                id: string;
                createdAt: Date;
                rank: string | null;
                role: string | null;
                hoursPlayed: number | null;
                note: string | null;
                userId: string;
                gameId: string;
            })[];
            id: string;
            email: string;
            username: string;
            emailVerified: boolean;
            emailVerificationToken: string | null;
            emailVerificationExpiresAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
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
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
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
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
    private static PACKAGES;
    usePentakill(userId: string): Promise<{
        pentakillsLeft: number;
    }>;
    saveFilters(userId: string, filters: {
        filterGender?: string;
        filterAgeMin?: number;
        filterAgeMax?: number;
        filterMicOnly?: boolean;
        filterPlayStyles?: string[];
        filterActivity?: string;
    }): Promise<{
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
    }>;
    activatePremium(userId: string, planId: string): Promise<{
        isPremium: boolean;
        premiumPlan: string | null;
        premiumExpiresAt: Date | null;
    }>;
    purchasePentakill(userId: string, packageId: string): Promise<{
        pentakillsLeft: number;
        added: number;
    }>;
    getProfileById(profileUserId: string): Promise<{
        user: {
            userGames: ({
                game: {
                    id: string;
                    name: string;
                    slug: string;
                    iconUrl: string | null;
                    category: import(".prisma/client").$Enums.GameCategory;
                };
            } & {
                id: string;
                createdAt: Date;
                rank: string | null;
                role: string | null;
                hoursPlayed: number | null;
                note: string | null;
                userId: string;
                gameId: string;
            })[];
            id: string;
            email: string;
            username: string;
            emailVerified: boolean;
            emailVerificationToken: string | null;
            emailVerificationExpiresAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
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
    }>;
}
