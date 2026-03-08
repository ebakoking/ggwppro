import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
  Matches,
} from 'class-validator';
import { Gender, PlayStyle, GameLevel } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  displayName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^https:\/\/images\.unsplash\.com\//, {
    message: 'Sadece önceden tanımlı avatarlar seçilebilir.',
  })
  avatarUrl?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(PlayStyle)
  @IsOptional()
  playStyle?: PlayStyle;

  @IsEnum(GameLevel)
  @IsOptional()
  gameLevel?: GameLevel;

  @IsBoolean()
  @IsOptional()
  usesMic?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}
