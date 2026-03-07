import { Gender, PlayStyle, GameLevel } from '@prisma/client';
export declare class UpdateProfileDto {
    displayName?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    gender?: Gender;
    playStyle?: PlayStyle;
    gameLevel?: GameLevel;
    usesMic?: boolean;
    bio?: string;
    isPremium?: boolean;
}
