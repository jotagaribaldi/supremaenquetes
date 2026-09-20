import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class TenantGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = (await super.canActivate(context)) as boolean;
    if (!canActivate) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === 'admin') {
      return true;
    }

    const tenantId = request.params.tenantId || request.body.tenantId || request.query.tenantId;

    if (tenantId && user.tenantId !== tenantId) {
      throw new ForbiddenException('Acesso negado a este tenant');
    }

    request.tenantId = user.tenantId;
    return true;
  }
}