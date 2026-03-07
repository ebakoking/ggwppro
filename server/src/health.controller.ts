import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return { name: 'GGWP API', status: 'ok', docs: '/api' };
  }

  @Get('health')
  health() {
    return { ok: true, timestamp: new Date().toISOString() };
  }
}
