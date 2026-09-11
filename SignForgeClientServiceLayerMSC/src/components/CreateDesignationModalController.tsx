import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
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

  const departmentKeys = useMemo(() => Object.keys(designationsMap), [designationsMap]);
  const departmentOptions: SelectOption[] = departmentKeys.map((dept) => ({
    value: dept,
    label: dept,
  }));

  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const [department, setDepartment] = useState<string>(initialDepartment);
  const [designationName, setDesignationName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exitDirection, setExitDirection] = useState<'down' | 'up'>('down');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isClosingRef = React.useRef(false);

  const addDesignationMutation = TanstackQueryClientService.current.configurationConstant.useAddDesignationMutation();

  useEffect(() => {
    setInternalIsOpen(isOpen);
    if (isOpen) {
      isClosingRef.current = false;
      setDepartment(initialDepartment || (departmentKeys.length > 0 ? departmentKeys[0] : 'Engineering'));
      setDesignationName('');
      setErrorMessage(null);
      setExitDirection('down');
      // Prevent browser jump scroll on focus
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialDepartment, departmentKeys]);

  const handleHeaderOrBackdropClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setExitDirection('down');
    setInternalIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 550);
  };

  const handleCancel = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setExitDirection('up');
    setInternalIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 550);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      handleHeaderOrBackdropClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create designation.';
      setErrorMessage(msg);
    }
  };

  return (
    <ModalSharedComponent
      isOpen={internalIsOpen}
      onClose={handleHeaderOrBackdropClose}
      exitDirection={exitDirection}
      headerCloseDirection="down"
      title="Create New Designation"
      subtitle="Register a new job role title mapped directly to an enterprise department"
      maxWidth="md"
      zIndex={60}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ButtonSharedComponent
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCancel}
            disabled={addDesignationMutation.isPending}
          >
            Cancel
          </ButtonSharedComponent>
          <PrimaryActionButtonSharedComponent
            type="submit"
            size="sm"
            onClick={() => handleSubmit()}
            isLoading={addDesignationMutation.isPending}
            loadingText="Creating..."
            icon={<Plus className="w-3.5 h-3.5 !text-white" />}
          >
            Create Designation
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
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
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
              className="w-full bg-slate-50 dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-[#0C2086] transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5">
            This title will be permanently registered and instantly selectable under the {department} department.
          </p>
        </div>
      </form>
    </ModalSharedComponent>
  );
}
