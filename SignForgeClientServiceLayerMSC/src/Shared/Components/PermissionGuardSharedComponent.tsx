import React from 'react';
import { UserRoleType } from '../../Types';
import useAuthenticationStateStore from '../../Store/AuthenticationStateStore';
import ApplicationPermissionService from '../../Services/ApplicationPermissionService';

export interface PermissionGuardSharedComponentProps {
  permission: Set<UserRoleType>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Declarative component that conditionally renders its children only if
 * the current authenticated user's role is included in the allowed permission set.
 */
export default function PermissionGuardSharedComponent({
  permission,
  children,
  fallback = null,
}: PermissionGuardSharedComponentProps): React.JSX.Element | null {
  const userRole = useAuthenticationStateStore((state) => state.user?.role);
  const hasAccess = ApplicationPermissionService.current.hasPermission(permission);

  if (!hasAccess) {
    return fallback ? <React.Fragment>{fallback}</React.Fragment> : null;
  }

  return <React.Fragment>{children}</React.Fragment>;
}
