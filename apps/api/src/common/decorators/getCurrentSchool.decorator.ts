import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const GetCurrentSchool = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user?.ldapGroups) {
    throw new UnauthorizedException('ldapGroups in JWT is missing');
  }

  const schools: Set<string> = new Set(
    request.user.ldapGroups
      .filter((path) => !path.startsWith('/role') && !path.startsWith('/p_'))
      .map((path) => {
        const match = path.match(/\/([^/-]+)-/);
        return match ? match[1] : null;
      })
      .filter(Boolean),
  ) as Set<string>;

  if (schools.size === 0) {
    schools.add('default-school');
  }

  if (schools.size === 0) {
    throw new UnauthorizedException('No valid school found in ldapGroups');
  }

  return schools.values().next().value as string;
});

export default GetCurrentSchool;
