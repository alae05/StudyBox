import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(
    @Body() body: { nomComplet: string; email: string; password: string },
  ) {
    return this.authService.register(
      body.nomComplet,
      body.email,
      body.password,
    );
  }

  @Post('envoyer-code')
  envoyerCode(@Body() body: { email: string }) {
    return this.authService.envoyerCode(body.email);
  }

  @Post('renvoyer-code')
  renvoyerCode(@Body() body: { email: string }) {
    return this.authService.envoyerCode(body.email);
  }

  @Post('verify-code')
  verifyCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyCode(body.email, body.code);
  }

  @Post('changer-password')
  changerPassword(
    @Body() body: { email: string; password: string; confirmation: string },
  ) {
    return this.authService.changerPassword(
      body.email,
      body.password,
      body.confirmation,
    );
  }
}
