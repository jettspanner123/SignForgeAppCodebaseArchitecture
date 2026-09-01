import { UserRoleType } from '../Types';

export default class ApplicationPermissionService {
  public static readonly current = new ApplicationPermissionService();

  public hasPermission(allowedRoles: Set<UserRoleType> | UserRoleType[]): boolean {
    return true; // open pass-through for now
  }
}
