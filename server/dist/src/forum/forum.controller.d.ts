import { ForumService } from './forum.service';
export declare class ForumController {
    private forumService;
    constructor(forumService: ForumService);
    getPosts(gameId?: string, limit?: string, cursor?: string): Promise<({
        _count: {
            comments: number;
            likes: number;
        };
        game: {
            id: string;
            name: string;
            slug: string;
            iconUrl: string | null;
            category: import(".prisma/client").$Enums.GameCategory;
        };
        author: {
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        gameId: string;
        content: string;
        authorId: string;
        title: string;
        linkUrl: string | null;
        likeCount: number;
        commentCount: number;
    })[]>;
    getPost(id: string): Promise<{
        _count: {
            likes: number;
        };
        game: {
            id: string;
            name: string;
            slug: string;
            iconUrl: string | null;
            category: import(".prisma/client").$Enums.GameCategory;
        };
        author: {
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
        comments: ({
            author: {
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
        } & {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
            postId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        gameId: string;
        content: string;
        authorId: string;
        title: string;
        linkUrl: string | null;
        likeCount: number;
        commentCount: number;
    }>;
    createPost(req: any, body: {
        gameId: string;
        title: string;
        content: string;
        linkUrl?: string;
    }): Promise<{
        game: {
            id: string;
            name: string;
            slug: string;
            iconUrl: string | null;
            category: import(".prisma/client").$Enums.GameCategory;
        };
        author: {
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        gameId: string;
        content: string;
        authorId: string;
        title: string;
        linkUrl: string | null;
        likeCount: number;
        commentCount: number;
    }>;
    addComment(req: any, postId: string, body: {
        content: string;
    }): Promise<{
        author: {
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
    } & {
        id: string;
        createdAt: Date;
        content: string;
        authorId: string;
        postId: string;
    }>;
    toggleLike(req: any, postId: string): Promise<{
        liked: boolean;
    }>;
}
