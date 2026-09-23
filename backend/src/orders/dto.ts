import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { COURSE_FORMATS, COURSE_TYPES, COURSES, STATUSES } from '../common/constants';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(25)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  surname?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '')
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  phone?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v !== null)
  @IsInt()
  age?: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== '')
  @IsIn(COURSES)
  course?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '')
  @IsIn(COURSE_FORMATS)
  course_format?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '')
  @IsIn(COURSE_TYPES)
  course_type?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '')
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v !== null)
  @IsInt()
  sum?: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v !== null)
  @IsInt()
  alreadyPaid?: number;

  @IsOptional()
  @IsString()
  group?: string;
}

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
