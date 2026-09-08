import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Sparkles } from 'lucide-react';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import CustomSelectSharedComponent, { SelectOption } from '../Shared/Components/CustomSelectSharedComponent';
import TanstackQueryClientService from '../Services/TanstackQueryClientService';

export interface CreateDesignationModalControllerProps {
  isOpen: boolean;
  initialDepartment?: string;
  onClose: () => void;
  onCreated?: (department: string, designation: string) => void;
}

export default function CreateDesignationModalController({
  isOpen,
  initialDepartment = 'Engineering',
  onClose,
  onCreated,
}: CreateDesignationModalControllerProps): React.JSX.Element {
  const { data: designationsMap = {} } = TanstackQueryClientService.current.configurationConstant.useDesignationsQuery();

  const departmentKeys = Object.keys(designationsMap);
  const departmentOptions: SelectOption[] = departmentKeys.map((dept) => ({
    value: dept,
    label: dept,
  }));

  const [department, setDepartment] = useState<string>(initialDepartment);
  const [designationName, setDesignationName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addDesignationMutation = TanstackQueryClientService.current.configurationConstant.useAddDesignationMutation();

  useEffect(() => {
    if (isOpen) {
      setDepartment(initialDepartment || (departmentKeys.length > 0 ? departmentKeys[0] : 'Engineering'));
      setDesignationName('');
      setErrorMessage(null);
      // Prevent browser jump scroll on focus
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialDepartment, departmentKeys]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDesignation = designationName.trim();
    if (!trimmedDesignation) {
      setErrorMessage('Please enter a designation title.');
      return;
    }

    try {
      setErrorMessage(null);
      await addDesignationMutation.mutateAsync({
        department: department.trim(),
        designation: trimmedDesignation,
      });

      if (onCreated) {
        onCreated(department.trim(), trimmedDesignation);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create designation.';
      setErrorMessage(msg);
    }
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>Create New Designation</span>
        </div>
      }
      subtitle="Register a new job role title mapped directly to an enterprise department"
      maxWidth="md"
      scrollMode="backdrop"
      animationType="slide-up"
      zIndex={60}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 text-xs">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
            Target Department <span className="text-rose-500">*</span>
          </label>
          <CustomSelectSharedComponent
            value={department}
            onChange={setDepartment}
            options={departmentOptions}
            searchable={true}
            searchPlaceholder="Search departments..."
            size="sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
            Designation / Role Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              required
              value={designationName}
              onChange={(e) => setDesignationName(e.target.value)}
              placeholder="e.g. Lead AI Systems Architect"
              className="w-full bg-slate-50 dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-blue-500 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            This title will be permanently registered and instantly selectable under the {department} department.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-zinc-800 mt-5">
          <ButtonSharedComponent
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={addDesignationMutation.isPending}
          >
            Cancel
          </ButtonSharedComponent>
          <ButtonSharedComponent
            type="submit"
            variant="primary"
            size="sm"
            isLoading={addDesignationMutation.isPending}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Designation
          </ButtonSharedComponent>
        </div>
      </form>
    </ModalSharedComponent>
  );
}
