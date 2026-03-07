import { PrismaService } from '../prisma/prisma.service';
export declare class GameService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllGames(category?: string): Promise<{
        id: string;
        name: string;
        slug: string;
        iconUrl: string | null;
        category: import(".prisma/client").$Enums.GameCategory;
    }[]>;
    getMyGames(userId: string): Promise<({
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
    })[]>;
    setMyGames(userId: string, games: {
        gameId: string;
        rank?: string;
        role?: string;
    }[]): Promise<({
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
    })[]>;
    addGame(userId: string, gameId: string, rank?: string, role?: string): Promise<{
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
    }>;
    removeGame(userId: string, gameId: string): Promise<void>;
}
