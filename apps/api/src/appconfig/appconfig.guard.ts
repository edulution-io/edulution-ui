import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import AuthErrorMessages from '@libs/auth/authErrorMessages';
import { Request } from 'express';
import GroupRoles from '@libs/groups/types/group-roles.enum';

@Injectable()
class AppConfigGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new CustomHttpException(AuthErrorMessages.Unknown, HttpStatus.NOT_FOUND);
    }

    const ldapGroups = user.ldapGroups || [];

    if (ldapGroups.includes(GroupRoles.SUPER_ADMIN)) {
      return true;
    }
    throw new CustomHttpException(AuthErrorMessages.Unauthorized, HttpStatus.UNAUTHORIZED);
  }
}

export default AppConfigGuard;
