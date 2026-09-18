import { UserRoleType } from '../Types';

export default class ApplicationPermissionPreset {
  public static current: ApplicationPermissionPreset = new ApplicationPermissionPreset();

  public allRoles(): Set<UserRoleType> {
    return new Set([
      UserRoleType.HR_MANAGER,
      UserRoleType.ADMIN,
      UserRoleType.EXECUTIVE_DIRECTOR,
      UserRoleType.DEVELOPER,
    ]);
  }

  /** Every role except HR_MANAGER - i.e. "higher than HR" in the org hierarchy. */
  public aboveHrRoles(): Set<UserRoleType> {
    return new Set([
      UserRoleType.ADMIN,
      UserRoleType.EXECUTIVE_DIRECTOR,
      UserRoleType.DEVELOPER,
    ]);
  }

  public managementRoles(): Set<UserRoleType> {
    return new Set([UserRoleType.ADMIN, UserRoleType.EXECUTIVE_DIRECTOR]);
  }

  public hrManagerOnly(): Set<UserRoleType> {
    return new Set([UserRoleType.HR_MANAGER]);
  }

  public adminOnly(): Set<UserRoleType> {
    return new Set([UserRoleType.ADMIN]);
  }

  public developerOnly(): Set<UserRoleType> {
    return new Set([UserRoleType.DEVELOPER]);
  }
}
