import React, { useState, useEffect } from 'react';
import { MapPin, Plus } from 'lucide-react';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import TanstackQueryClientService from '../Services/TanstackQueryClientService';

export interface CreateWorkLocationModalControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (locationName: string) => void;
}

export default function CreateWorkLocationModalController({
  isOpen,
  onClose,
  onCreated,
}: CreateWorkLocationModalControllerProps): React.JSX.Element {
  const [locationName, setLocationName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addWorkLocationMutation = TanstackQueryClientService.current.configurationConstant.useAddWorkLocationMutation();

  useEffect(() => {
    if (isOpen) {
      setLocationName('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLocation = locationName.trim();
    if (!trimmedLocation) {
      setErrorMessage('Please enter a location name.');
      return;
    }

    try {
      setErrorMessage(null);
      await addWorkLocationMutation.mutateAsync({
        location: trimmedLocation,
      });

      if (onCreated) {
        onCreated(trimmedLocation);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create work location.';
      setErrorMessage(msg);
    }
  };

  return (
    <ModalSharedComponent
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <span>Create New Work Location</span>
        </div>
      }
      subtitle="Register a new corporate office or remote work hub into the enterprise directory"
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
            Work Location Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              autoFocus
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Pune / Innovation Hub"
              className="w-full bg-slate-50 dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-emerald-500 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            This location will be permanently saved in AS_ConfigurationConstantTBL and immediately selectable across all offer letter templates.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-zinc-800 mt-5">
          <ButtonSharedComponent
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={addWorkLocationMutation.isPending}
          >
            Cancel
          </ButtonSharedComponent>
          <ButtonSharedComponent
            type="submit"
            variant="primary"
            size="sm"
            isLoading={addWorkLocationMutation.isPending}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Work Location
          </ButtonSharedComponent>
        </div>
      </form>
    </ModalSharedComponent>
  );
}
