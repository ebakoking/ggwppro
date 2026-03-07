import { SwipeAction } from '@prisma/client';
import { SwipeService } from './swipe.service';
export declare class SwipeController {
    private swipeService;
    constructor(swipeService: SwipeService);
    swipe(req: any, body: {
        toId: string;
        action: SwipeAction;
        gameId: string;
    }): Promise<{
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
    whoLikedMe(req: any, gameId: string): Promise<({
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
