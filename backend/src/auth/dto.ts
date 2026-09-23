import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class ActivateDto {
  @MinLength(4)
  password: string;

  @IsNotEmpty()
  confirmPassword: string;
}

export class CreateManagerDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  surname: string;
}
