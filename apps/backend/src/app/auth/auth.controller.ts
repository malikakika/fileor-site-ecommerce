import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { IsString, MinLength } from 'class-validator';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { OAuth2Client } from 'google-auth-library';
import { UnauthorizedException } from '@nestjs/common';

class ChangePasswordDto {
  @IsString()
  oldPassword!: string;

  @IsString()
  @MinLength(6, { message: 'newPassword must be at least 6 characters' })
  newPassword!: string;
}

interface JwtUserPayload {
  userId: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly users: UsersService
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // redirigé automatiquement vers Google
  }
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request) {
    const user = req.user;
    return this.authService.socialLogin(user);
  }
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.email.trim().toLowerCase(),
      body.password
    );
    return this.authService.login(user);
  }

  @Post('google/token')
async googleToken(@Body('idToken') idToken: string) {
  if (!idToken) throw new UnauthorizedException('Missing Google token');

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new UnauthorizedException('Invalid Google token');
  }

  const user = {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    provider: 'google',
  };

  return this.authService.socialLogin(user);
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
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthenticatedRequest) {
    const user = await this.users.findOne(req.user.userId);
    if (!user) return { message: 'Utilisateur introuvable' };

    const { id, email, name, role, createdAt, updatedAt } = user;
    return { id, email, name, role, createdAt, updatedAt };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: ChangePasswordDto
  ) {
    await this.authService.changePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword
    );
    return { ok: true };
  }
}
