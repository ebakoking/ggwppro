import { PrismaService } from '../prisma/prisma.service';
export declare function seedBots(prisma: PrismaService, count?: number): Promise<{
    botsCreated: number;
    likesCreated: number;
}>;
