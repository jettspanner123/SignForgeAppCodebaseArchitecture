import React from 'react';
import { User, Users } from 'lucide-react';
import { UserSummaryModel } from '../../Models/RequestFeatureModel';
import CustomSelectSharedComponent, { SelectOption } from '../../../../Shared/Components/CustomSelectSharedComponent';

interface UserSelectorColumnStaticComponentProps {
  users: UserSummaryModel[];
  selectedUser: UserSummaryModel | null;
  isLoadingUsers: boolean;
  onSelectUser: (user: UserSummaryModel | null) => void;
}

export default function UserSelectorColumnStaticComponent({
  users,
  selectedUser,
  isLoadingUsers,
  onSelectUser,
}: UserSelectorColumnStaticComponentProps): React.JSX.Element {
  const getInitials = (user: UserSummaryModel): string => {
    const first = (user.firstName || '').charAt(0).toUpperCase();
    const last = (user.lastName || '').charAt(0).toUpperCase();
    return first || last ? `${first}${last}` : user.email.slice(0, 2).toUpperCase();
  };

  const userSelectOptions: SelectOption[] = React.useMemo(() => {
    return users.map((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Enterprise User';
      return {
        value: u.id,
        label: `${fullName} (${u.email}) - ${u.role || 'Member'}`,
        sublabel: u.department ? `Department: ${u.department}` : undefined,
        icon: (
          <div className="w-7 h-7 rounded-full bg-[#0C2086] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
            {getInitials(u)}
          </div>
        ),
      };
    });
  }, [users]);

  return (
    <div className="w-full lg:w-[32%] lg:max-w-sm shrink-0 space-y-4">
      <div className="rounded-2xl bg-white dark:bg-[#0a0a0c] border border-slate-200/80 dark:border-zinc-800/80 p-5 shadow-xs space-y-5">
        {/* Section: Target Enterprise Account */}
        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
          <User className="w-3.5 h-3.5 text-[#0C2086] dark:text-blue-400" />
          <span>Target Enterprise Account</span>
        </h4>

        {/* User CustomSelect Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Select Enterprise Account <span className="text-rose-500">*</span>
          </label>

          {isLoadingUsers ? (
            <div className="h-11 sm:h-9 w-full rounded-xl sm:rounded-lg bg-slate-100 dark:bg-zinc-900 animate-pulse border border-slate-200 dark:border-zinc-800 flex items-center px-3">
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-sans">
                Loading directory accounts...
              </span>
            </div>
          ) : (
            <CustomSelectSharedComponent
              value={selectedUser ? selectedUser.id : ''}
              options={userSelectOptions}
              onChange={(val) => {
                const found = users.find((u) => u.id === val) || null;
                onSelectUser(found);
              }}
              placeholder="-- Choose an Enterprise User --"
              searchable={true}
              searchPlaceholder="Search accounts by name, email, or role..."
              size="sm"
            />
          )}
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Requests are audited and linked directly to this account.
          </p>
        </div>
      </div>
    </div>
  );
}
