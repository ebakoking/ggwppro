import { PrismaService } from './prisma/prisma.service';
export declare class SeedController {
    private prisma;
    constructor(prisma: PrismaService);
    seed(): Promise<{
        ok: boolean;
        gamesSeeded: number;
        usersCreated: number;
        message: string;
    }>;
}
