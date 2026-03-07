import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Gender, PlayStyle, GameLevel } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
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
  bio?: string;
}
