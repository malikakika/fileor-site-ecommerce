import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { IsString, MinLength } from 'class-validator';

class ChangePasswordDto {
  @IsString()
  oldPassword!: string;

  @IsString()
  @MinLength(6, { message: 'newPassword must be at least 6 characters' })
  newPassword!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly users: UsersService
  ) {}
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.email.trim().toLowerCase(),
      body.password
    );
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const created = await this.authService.register(
      body.email.trim().toLowerCase(),
      body.password,
      body.name?.trim()
    );
    return {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: any) {
    const user = await this.users.findOne(req.user.userId);
    const { id, email, name, role, createdAt, updatedAt } = user;
    return { id, email, name, role, createdAt, updatedAt };
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    await this.authService.changePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword
    );
    return { ok: true };
  }
}
