import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorator/roles";

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}
//   canActivate(context: ExecutionContext): boolean {
//     // get the roles required
//     const roles = this.reflector.getAllAndOverride<string[]>('roles', [context.getHandler(), context.getClass()]);
//     if (!roles) {
//       return false;
//     }
//     const request = context.switchToHttp().getRequest();
//     const userRoles = request.headers?.role?.split(',');
//     return this.validateRoles(roles, userRoles);
//   }

//   validateRoles(roles: string[], userRoles: string[]) {
//     return roles.some(role => userRoles.includes(role));
//   }

// }

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    //this returns the array of users
    return requiredRoles.some((role) => user.roles.includes(role));

    //return requiredRoles.includes(user?.role);
  }
}



