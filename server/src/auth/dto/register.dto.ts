import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin.' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalı.' })
  @MaxLength(20, { message: 'Kullanıcı adı en fazla 20 karakter olmalı.' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Kullanıcı adı sadece harf, rakam, tire ve alt çizgi içerebilir.',
  })
  username: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalı.' })
  @MaxLength(72)
  @Matches(/(?=.*[a-zA-Z])/, {
    message: 'Şifre en az bir harf içermelidir.',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Şifre en az bir rakam içermelidir.',
  })
  password: string;

  @IsString()
  passwordConfirm: string;
}
