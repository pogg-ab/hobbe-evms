import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
     if (request?.user && typeof request.user === 'object' && 'sub' in request.user) {
      return request.user.sub;
    }
    return request.user; 
  },
);