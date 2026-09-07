import React from 'react';
import { User, Users, CheckCircle2 } from 'lucide-react';
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

  const getRoleBadgeColor = (role: string): string => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN') || r.includes('EXECUTIVE')) {
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    if (r.includes('HR')) {
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    return 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
  };

  const userSelectOptions: SelectOption[] = React.useMemo(() => {
    return users.map((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Enterprise User';
      return {
        value: u.id,
        label: `${fullName} (${u.email}) - ${u.role || 'Member'}`,
        sublabel: u.department ? `Department: ${u.department}` : undefined,
        icon: u.avatarUrl ? (
          <img
            src={u.avatarUrl}
            alt={fullName}
            className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#0C2086] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 shadow-2xs">
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

        {/* Selected User Detail Card */}
        {selectedUser ? (
          <div className="rounded-xl p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              {selectedUser.avatarUrl ? (
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.firstName}
                  className="w-10 h-10 rounded-full object-cover border border-blue-200 dark:border-blue-800 shadow-2xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0C2086] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs">
                  {getInitials(selectedUser)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || 'Enterprise User'}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100/60 dark:border-blue-900/30 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono tracking-wider">
                  Role
                </span>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-full ${getRoleBadgeColor(
                    selectedUser.role
                  )}`}
                >
                  {selectedUser.role || 'Member'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono tracking-wider">
                  Department
                </span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium truncate block mt-0.5">
                  {selectedUser.department || 'General'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 p-4 text-center space-y-2">
            <div className="p-2.5 rounded-full bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 inline-flex">
              <User className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              No account selected yet
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-snug">
              Choose an active enterprise user from the dropdown above to unlock proposal fields.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
