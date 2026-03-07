import { GameService } from './game.service';
export declare class GameController {
    private gameService;
    constructor(gameService: GameService);
    getAllGames(category?: string): Promise<{
        id: string;
        name: string;
        slug: string;
        iconUrl: string | null;
        category: import(".prisma/client").$Enums.GameCategory;
    }[]>;
    getMyGames(req: any): Promise<({
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
    setMyGames(req: any, body: {
        games: {
            gameId: string;
            rank?: string;
            role?: string;
        }[];
    }): Promise<({
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
    addGame(req: any, body: {
        gameId: string;
        rank?: string;
        role?: string;
    }): Promise<{
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
    removeGame(req: any, gameId: string): Promise<void>;
}
