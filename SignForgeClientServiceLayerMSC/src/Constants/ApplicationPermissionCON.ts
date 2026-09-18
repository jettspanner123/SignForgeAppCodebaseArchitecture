import ApplicationPermissionPreset from '../Presets/ApplicationPermissionPreset';
import { UserRoleType } from '../Types';

export default class ApplicationPermissionCON {
  /** Only roles above HR_MANAGER may define new enterprise work locations. */
  public static readonly CAN_CREATE_WORK_LOCATION: Set<UserRoleType> =
    ApplicationPermissionPreset.current.aboveHrRoles();
}
