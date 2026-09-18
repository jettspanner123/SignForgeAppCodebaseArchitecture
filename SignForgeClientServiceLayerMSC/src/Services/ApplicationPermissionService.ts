import { UserRoleType } from '../Types';
import useAuthenticationStateStore from '../Store/AuthenticationStateStore';

export default class ApplicationPermissionService {
  public static readonly current = new ApplicationPermissionService();

  /**
   * Retrieves the currently active user role from the Zustand store.
   */
  public getUserRole(): UserRoleType | null {
    const rawRole = useAuthenticationStateStore.getState().user?.role;
    if (!rawRole) return null;

    const upper = String(rawRole).toUpperCase();
    if (upper in UserRoleType) {
      return UserRoleType[upper as keyof typeof UserRoleType];
    }
    return null;
  }

  /**
   * Checks if current user matches a single required role.
   */
  public hasRole(requiredRole: UserRoleType): boolean {
    return this.getUserRole() === requiredRole;
  }

  /**
   * Checks if current user's role is in the allowed Set of roles.
   */
  public hasPermission(allowedRoles: Set<UserRoleType>): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    return allowedRoles.has(userRole);
  }

  public isHrManager(): boolean {
    return this.hasRole(UserRoleType.HR_MANAGER);
  }

  public isAdmin(): boolean {
    return this.hasRole(UserRoleType.ADMIN);
  }

  public isExecutiveDirector(): boolean {
    return this.hasRole(UserRoleType.EXECUTIVE_DIRECTOR);
  }

  public isDeveloper(): boolean {
    return this.hasRole(UserRoleType.DEVELOPER);
  }
}
