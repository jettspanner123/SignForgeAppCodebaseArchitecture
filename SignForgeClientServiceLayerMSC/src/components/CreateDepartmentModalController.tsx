import React, { useState, useEffect } from 'react';
import { Building2, Plus } from 'lucide-react';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import TanstackQueryClientService from '../Services/TanstackQueryClientService';

export interface CreateDepartmentModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (departmentName: string) => void;
}

export default function CreateDepartmentModalController({
  isOpen,
  onClose,
  onCreated,
}: CreateDepartmentModalControllerProps): React.JSX.Element {
  const [departmentName, setDepartmentName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addDepartmentMutation = TanstackQueryClientService.current.configurationConstant.useAddDepartmentMutation();

  useEffect(() => {
    if (isOpen) {
      setDepartmentName('');
      setErrorMessage(null);
      // Prevent browser jump scroll on focus
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDepartment = departmentName.trim();
    if (!trimmedDepartment) {
      setErrorMessage('Please enter a department name.');
      return;
    }

    try {
      setErrorMessage(null);
      await addDepartmentMutation.mutateAsync({
        department: trimmedDepartment,
      });

      if (onCreated) {
        onCreated(trimmedDepartment);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create department.';
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
            <Building2 className="w-4 h-4" />
          </div>
          <span>Create New Department</span>
        </div>
      }
      subtitle="Register a new organizational department into the enterprise directory"
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
            Department Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              required
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="e.g. Artificial Intelligence Research"
              className="w-full bg-slate-50 dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-blue-500 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            This department will be permanently saved in AS_ConfigurationConstantTBL and immediately available for assigning designations.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-zinc-800 mt-5">
          <ButtonSharedComponent
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={addDepartmentMutation.isPending}
          >
            Cancel
          </ButtonSharedComponent>
          <ButtonSharedComponent
            type="submit"
            variant="primary"
            size="sm"
            isLoading={addDepartmentMutation.isPending}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Department
          </ButtonSharedComponent>
        </div>
      </form>
    </ModalSharedComponent>
  );
}
