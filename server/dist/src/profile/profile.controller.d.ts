import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileController {
    private profileService;
    constructor(profileService: ProfileService);
    getMyProfile(req: any): Promise<{
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
    updateMyProfile(req: any, dto: UpdateProfileDto): Promise<{
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
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
    usePentakill(req: any): Promise<{
        pentakillsLeft: number;
    }>;
    saveFilters(req: any, body: {
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
    activatePremium(req: any, body: {
        planId: string;
    }): Promise<{
        isPremium: boolean;
        premiumPlan: string | null;
        premiumExpiresAt: Date | null;
    }>;
    purchasePentakill(req: any, body: {
        packageId: string;
    }): Promise<{
        pentakillsLeft: number;
        added: number;
    }>;
    getProfileById(userId: string): Promise<{
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
