import React, { useState, useEffect } from 'react';
import { Building2, Plus } from 'lucide-react';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      title="Create New Department"
      subtitle="Register a new organizational department into the enterprise directory"
      maxWidth="md"
      zIndex={60}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ButtonSharedComponent
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={addDepartmentMutation.isPending}
          >
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            type="submit"
            size="sm"
            onClick={() => handleSubmit()}
            isLoading={addDepartmentMutation.isPending}
            loadingText="Creating..."
            icon={<Plus className="w-3.5 h-3.5 !text-white" />}
          >
            Create Department
          </PrimaryActionButtonSharedComponent>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 text-xs">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
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
              className="w-full bg-slate-50 dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-[#0C2086] transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5">
            This department will be permanently saved in AS_ConfigurationConstantTBL and immediately available for assigning designations.
          </p>
        </div>
      </form>
    </ModalSharedComponent>
  );
}
